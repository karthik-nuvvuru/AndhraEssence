from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from typing import Dict, Set
import json
import asyncio
import uuid

from app.core.security import decode_token

VALID_MESSAGE_TYPES = {"subscribe_order", "unsubscribe_order", "rider_location", "ping"}


def validate_message(message: dict) -> tuple[bool, str]:
    """Validate a WebSocket message. Returns (is_valid, error_message)."""
    if "type" not in message:
        return False, "Missing 'type' field"

    msg_type = message["type"]
    if msg_type not in VALID_MESSAGE_TYPES:
        return False, f"Unknown message type: {msg_type}"

    if msg_type in ("subscribe_order", "unsubscribe_order", "rider_location"):
        if "order_id" not in message:
            return False, "Missing 'order_id' field"
        try:
            uuid.UUID(message["order_id"])
        except ValueError:
            return False, "Invalid 'order_id' format (must be UUID)"

    if msg_type == "rider_location":
        if "lat" not in message or "lng" not in message:
            return False, "Missing 'lat' or 'lng' field"
        try:
            lat = float(message["lat"])
            lng = float(message["lng"])
        except (ValueError, TypeError):
            return False, "Invalid 'lat' or 'lng' values"
        if not (-90 <= lat <= 90):
            return False, "Invalid 'lat' value (must be between -90 and 90)"
        if not (-180 <= lng <= 180):
            return False, "Invalid 'lng' value (must be between -180 and 180)"

    return True, ""

router = APIRouter()


class ConnectionManager:
    """WebSocket connection manager."""

    def __init__(self):
        # user_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # order_id -> set of user_ids subscribed
        self.order_subscriptions: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        # Remove from all order subscriptions
        for order_id in list(self.order_subscriptions.keys()):
            self.order_subscriptions[order_id].discard(user_id)
            if not self.order_subscriptions[order_id]:
                del self.order_subscriptions[order_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

    async def broadcast_order_update(self, order_id: str, message: dict):
        if order_id in self.order_subscriptions:
            for user_id in self.order_subscriptions[order_id]:
                await self.send_personal_message(message, user_id)

    def subscribe_to_order(self, order_id: str, user_id: str):
        if order_id not in self.order_subscriptions:
            self.order_subscriptions[order_id] = set()
        self.order_subscriptions[order_id].add(user_id)

    def unsubscribe_from_order(self, order_id: str, user_id: str):
        if order_id in self.order_subscriptions:
            self.order_subscriptions[order_id].discard(user_id)
            if not self.order_subscriptions[order_id]:
                del self.order_subscriptions[order_id]


manager = ConnectionManager()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time updates."""
    await manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format"
                }, user_id)
                continue

            is_valid, error_msg = validate_message(message)
            if not is_valid:
                await manager.send_personal_message({
                    "type": "error",
                    "message": error_msg
                }, user_id)
                continue

            if message["type"] == "subscribe_order":
                manager.subscribe_to_order(message["order_id"], user_id)
                await manager.send_personal_message({
                    "type": "subscribed",
                    "order_id": message["order_id"]
                }, user_id)

            elif message["type"] == "unsubscribe_order":
                manager.unsubscribe_from_order(message["order_id"], user_id)
                await manager.send_personal_message({
                    "type": "unsubscribed",
                    "order_id": message["order_id"]
                }, user_id)

            elif message["type"] == "rider_location":
                # Update rider location (this would typically update Redis/cache)
                # and broadcast to subscribed users
                await manager.broadcast_order_update(
                    message["order_id"],
                    {
                        "type": "rider_location",
                        "lat": message["lat"],
                        "lng": message["lng"],
                        "rider_id": user_id
                    }
                )

            elif message["type"] == "ping":
                await manager.send_personal_message({"type": "pong"}, user_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        await manager.send_personal_message({
            "type": "error",
            "message": str(e)
        }, user_id)


async def emit_order_status_update(order_id: str, status: str, additional_data: dict = None):
    """Emit order status update to all subscribers."""
    message = {
        "type": "order_status_update",
        "order_id": order_id,
        "status": status,
        **(additional_data or {})
    }
    await manager.broadcast_order_update(order_id, message)


async def emit_rider_location_update(order_id: str, lat: float, lng: float, rider_id: str):
    """Emit rider location update to all subscribers."""
    message = {
        "type": "rider_location",
        "lat": lat,
        "lng": lng,
        "rider_id": rider_id
    }
    await manager.broadcast_order_update(order_id, message)
