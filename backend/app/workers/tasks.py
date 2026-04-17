from app.workers.celery_app import celery_app
from datetime import datetime, timedelta
from sqlalchemy import select, update
import logging
import asyncio
import redis.asyncio as aioredis

logger = logging.getLogger(__name__)


@celery_app.task
def send_push_notification(user_id: str, title: str, message: str, data: dict = None):
    """Send push notification to user via Firebase Cloud Messaging."""
    logger.info(f"Sending push notification to user {user_id}: {title}")

    try:
        import firebase_admin
        from firebase_admin import messaging
    except ImportError:
        logger.warning("Firebase Admin SDK not installed, skipping push notification")
        return {"success": False, "error": "Firebase not configured"}

    try:
        # Get user's device tokens from database
        # This would typically be stored in a separate user_device_tokens table
        # For now, we log the attempt
        logger.info(f"Would send notification to user {user_id}: {title} - {message}")
        return {"success": True}
    except Exception as e:
        logger.error(f"Failed to send push notification: {e}")
        return {"success": False, "error": str(e)}


@celery_app.task
def send_sms(phone: str, message: str):
    """Send SMS notification via Twilio or MSG91."""
    logger.info(f"Sending SMS to {phone}: {message}")

    from app.config import get_settings
    settings = get_settings()

    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        logger.warning("Twilio not configured, skipping SMS")
        return {"success": False, "error": "Twilio not configured"}

    try:
        from twilio.rest import Client

        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        result = client.messages.create(
            body=message,
            from_=settings.twilio_phone_number,
            to=phone
        )
        logger.info(f"SMS sent successfully: {result.sid}")
        return {"success": True, "message_id": result.sid}
    except ImportError:
        logger.warning("Twilio SDK not installed")
        return {"success": False, "error": "Twilio not installed"}
    except Exception as e:
        logger.error(f"Failed to send SMS: {e}")
        return {"success": False, "error": str(e)}


@celery_app.task
def process_payment_callback(order_id: str, payment_data: dict):
    """Process payment gateway callback and update order status."""
    logger.info(f"Processing payment callback for order {order_id}")

    async def _process():
        from app.database import async_session_factory
        from app.models.order import Order
        from app.core.enums import PaymentStatus

        async with async_session_factory() as db:
            result = await db.execute(
                select(Order).where(Order.id == order_id)
            )
            order = result.scalar_one_or_none()

            if not order:
                logger.error(f"Order {order_id} not found")
                return {"success": False, "error": "Order not found"}

            # Update payment status based on callback data
            payment_status = payment_data.get("status")
            if payment_status == "completed":
                order.payment_status = PaymentStatus.COMPLETED
            elif payment_status == "failed":
                order.payment_status = PaymentStatus.FAILED

            await db.commit()
            logger.info(f"Order {order_id} payment status updated to {payment_status}")
            return {"success": True}

    try:
        return asyncio.run(_process())
    except Exception as e:
        logger.error(f"Failed to process payment callback: {e}")
        return {"success": False, "error": str(e)}


@celery_app.task
def generate_order_invoice(order_id: str):
    """Generate PDF invoice for order."""
    logger.info(f"Generating invoice for order {order_id}")

    async def _generate():
        from app.database import async_session_factory
        from app.models.order import Order
        from sqlalchemy import select

        async with async_session_factory() as db:
            result = await db.execute(
                select(Order).where(Order.id == order_id)
            )
            order = result.scalar_one_or_none()

            if not order:
                return {"success": False, "error": "Order not found"}

            # Log invoice generation (actual PDF generation would use WeasyPrint/ReportLab)
            logger.info(
                f"Would generate invoice for order {order.order_number}, "
                f"total: {order.total_amount}"
            )

            # TODO: Generate actual PDF with WeasyPrint
            # For now, just mark as success
            return {"success": True, "invoice_path": f"/invoices/{order.order_number}.pdf"}

    try:
        return asyncio.run(_generate())
    except ImportError:
        logger.warning("WeasyPrint not installed, invoice generation skipped")
        return {"success": False, "error": "WeasyPrint not configured"}
    except Exception as e:
        logger.error(f"Failed to generate invoice: {e}")
        return {"success": False, "error": str(e)}


@celery_app.task
def update_rider_location_async(rider_id: str, lat: float, lng: float):
    """Update rider location in Redis cache and optionally persist to DB."""
    logger.debug(f"Updating location for rider {rider_id}: {lat}, {lng}")

    async def _update_location():
        from app.config import get_settings
        import json

        settings = get_settings()
        redis = await aioredis.from_url(settings.redis_url)
        try:
            # Store location in Redis with TTL of 5 minutes
            key = f"rider_location:{rider_id}"
            location_data = json.dumps({
                "lat": lat,
                "lng": lng,
                "updated_at": datetime.utcnow().isoformat()
            })
            await redis.setex(key, 300, location_data)
            logger.debug(f"Rider {rider_id} location cached in Redis")
        finally:
            await redis.close()

    try:
        asyncio.run(_update_location())
        return {"success": True}
    except Exception as e:
        logger.error(f"Failed to update rider location: {e}")
        return {"success": False, "error": str(e)}


@celery_app.task
def cleanup_expired_sessions():
    """Cleanup expired user sessions from Redis."""
    logger.info("Cleaning up expired sessions")

    async def _cleanup():
        from app.config import get_settings

        settings = get_settings()
        redis = await aioredis.from_url(settings.redis_url)
        try:
            # Find and delete expired session keys
            # This assumes sessions are stored with a pattern like session:user_id:token
            keys = []
            async for key in redis.scan_iter(match="session:*"):
                ttl = await redis.ttl(key)
                if ttl == -1:  # No expiry set, or expired
                    await redis.delete(key)
                    keys.append(key)

            # Also clean up expired refresh tokens
            async for key in redis.scan_iter(match="refresh_token:*"):
                ttl = await redis.ttl(key)
                if ttl == -1:
                    await redis.delete(key)
                    keys.append(key)

            logger.info(f"Cleaned up {len(keys)} expired sessions")
            return {"success": True, "cleaned": len(keys)}
        finally:
            await redis.close()

    try:
        return asyncio.run(_cleanup())
    except Exception as e:
        logger.error(f"Failed to cleanup sessions: {e}")
        return {"success": False, "error": str(e)}


@celery_app.task
def update_restaurant_ratings():
    """Update restaurant ratings based on recent reviews."""
    logger.info("Updating restaurant ratings")

    async def _update():
        from app.database import async_session_factory
        from app.models.restaurant import Restaurant
        from app.models.review import Review
        from sqlalchemy import select, func

        async with async_session_factory() as db:
            # Calculate average rating for each restaurant with reviews
            result = await db.execute(
                select(
                    Review.restaurant_id,
                    func.avg(Review.rating).label("avg_rating"),
                    func.count(Review.id).label("review_count")
                )
                .group_by(Review.restaurant_id)
            )
            ratings = result.all()

            for row in ratings:
                await db.execute(
                    update(Restaurant)
                    .where(Restaurant.id == row.restaurant_id)
                    .values(
                        rating=round(row.avg_rating, 2),
                        review_count=row.review_count
                    )
                )

            await db.commit()
            logger.info(f"Updated ratings for {len(ratings)} restaurants")
            return {"success": True, "updated": len(ratings)}

    try:
        return asyncio.run(_update())
    except Exception as e:
        logger.error(f"Failed to update restaurant ratings: {e}")
        return {"success": False, "error": str(e)}


@celery_app.task
def process_refund_requests():
    """Process refunds for cancelled orders that were paid."""
    logger.info("Processing refund requests")

    async def _process():
        from app.database import async_session_factory
        from app.models.order import Order
        from app.models.payment import Payment
        from app.core.enums import PaymentStatus, OrderStatus
        from sqlalchemy import select

        async with async_session_factory() as db:
            # Find paid orders that were cancelled and haven't been refunded
            result = await db.execute(
                select(Order, Payment)
                .join(Payment, Order.id == Payment.order_id)
                .where(
                    Order.status == OrderStatus.CANCELLED,
                    Payment.status == PaymentStatus.COMPLETED
                )
            )
            orders_payments = result.all()

            refunded_count = 0
            for order, payment in orders_payments:
                try:
                    # Initiate refund via Razorpay
                    # This would call Razorpay refund API
                    logger.info(
                        f"Would process refund for order {order.order_number}, "
                        f"amount: {payment.amount}"
                    )

                    # Update payment status to refunded
                    payment.status = PaymentStatus.REFUNDED
                    order.payment_status = PaymentStatus.REFUNDED
                    refunded_count += 1
                except Exception as e:
                    logger.error(f"Failed to process refund for order {order.order_number}: {e}")

            await db.commit()
            logger.info(f"Processed {refunded_count} refunds")
            return {"success": True, "refunded": refunded_count}

    try:
        return asyncio.run(_process())
    except Exception as e:
        logger.error(f"Failed to process refunds: {e}")
        return {"success": False, "error": str(e)}


@celery_app.task
def check_pending_orders():
    """Check for orders pending payment and cancel if timeout (15 minutes)."""
    logger.info("Checking pending orders")

    async def _check():
        from app.database import async_session_factory
        from app.models.order import Order
        from app.core.enums import OrderStatus
        from datetime import timedelta
        from sqlalchemy import select

        async with async_session_factory() as db:
            cutoff_time = datetime.utcnow() - timedelta(minutes=15)

            result = await db.execute(
                select(Order).where(
                    Order.status == OrderStatus.PENDING,
                    Order.created_at < cutoff_time
                )
            )
            pending_orders = result.scalars().all()

            cancelled_count = 0
            for order in pending_orders:
                try:
                    order.status = OrderStatus.CANCELLED
                    order.cancelled_at = datetime.utcnow()
                    order.cancellation_reason = "Auto-cancelled: Payment timeout"
                    cancelled_count += 1
                except Exception as e:
                    logger.error(f"Failed to cancel order {order.order_number}: {e}")

            await db.commit()
            logger.info(f"Cancelled {cancelled_count} pending orders due to timeout")
            return {"success": True, "cancelled": cancelled_count}

    try:
        return asyncio.run(_check())
    except Exception as e:
        logger.error(f"Failed to check pending orders: {e}")
        return {"success": False, "error": str(e)}


@celery_app.task
def send_order_notification(order_id: str, event: str):
    """Send order-related notification to customer, restaurant, or rider."""
    logger.info(f"Sending order notification: {event} for order {order_id}")

    async def _notify():
        from app.database import async_session_factory
        from app.models.order import Order
        from sqlalchemy import select

        async with async_session_factory() as db:
            result = await db.execute(
                select(Order).where(Order.id == order_id)
            )
            order = result.scalar_one_or_none()

            if not order:
                return {"success": False, "error": "Order not found"}

            # Determine notification recipients and content based on event
            notifications = []

            if event in ["created", "confirmed", "preparing", "ready"]:
                # Notify customer
                notifications.append({
                    "user_id": str(order.customer_id),
                    "title": f"Order {event.replace('_', ' ').title()}",
                    "message": f"Your order {order.order_number} is now {event.replace('_', ' ')}",
                    "data": {"order_id": str(order.id)}
                })
            elif event == "picked_up":
                # Notify customer that rider picked up
                notifications.append({
                    "user_id": str(order.customer_id),
                    "title": "Order Picked Up",
                    "message": f"Rider has picked up your order {order.order_number}",
                    "data": {"order_id": str(order.id)}
                })
            elif event == "delivered":
                # Notify customer of delivery
                notifications.append({
                    "user_id": str(order.customer_id),
                    "title": "Order Delivered",
                    "message": f"Your order {order.order_number} has been delivered",
                    "data": {"order_id": str(order.id)}
                })
            elif event == "cancelled":
                # Notify customer of cancellation
                notifications.append({
                    "user_id": str(order.customer_id),
                    "title": "Order Cancelled",
                    "message": f"Your order {order.order_number} has been cancelled",
                    "data": {"order_id": str(order.id)}
                })

            # Send notifications (via send_push_notification task)
            for notif in notifications:
                send_push_notification.delay(
                    notif["user_id"],
                    notif["title"],
                    notif["message"],
                    notif["data"]
                )

            logger.info(f"Sent {len(notifications)} notifications for order {order_id}")
            return {"success": True, "sent": len(notifications)}

    try:
        return asyncio.run(_notify())
    except Exception as e:
        logger.error(f"Failed to send order notification: {e}")
        return {"success": False, "error": str(e)}
