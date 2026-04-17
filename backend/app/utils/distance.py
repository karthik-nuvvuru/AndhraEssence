"""Distance calculation utilities for rider delivery calculations."""

import math
from datetime import datetime, timedelta
from typing import Optional, Tuple
import httpx
from app.config import get_settings


# Constants for earnings calculation
BASE_EARNINGS = 30.0  # Base fee in currency units
PER_KM_RATE = 10.0    # Earnings per kilometer
MIN_EARNINGS = 40.0   # Minimum earnings per delivery

# Average delivery speed in km/h (accounting for traffic, stops, etc.)
AVERAGE_DELIVERY_SPEED_KMH = 25.0


def calculate_haversine_distance(
    lat1: float, lon1: float,
    lat2: float, lon2: float
) -> float:
    """
    Calculate the geodesic distance between two points using the Haversine formula.

    Args:
        lat1: Latitude of point 1 in degrees
        lon1: Longitude of point 1 in degrees
        lat2: Latitude of point 2 in degrees
        lon2: Longitude of point 2 in degrees

    Returns:
        Distance in kilometers
    """
    R = 6371.0  # Earth's radius in kilometers

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


async def calculate_distance_with_google_maps(
    origin_lat: float, origin_lon: float,
    dest_lat: float, dest_lon: float,
    api_key: Optional[str] = None
) -> Tuple[float, Optional[str]]:
    """
    Calculate distance using Google Maps Distance Matrix API.

    Args:
        origin_lat: Origin latitude
        origin_lon: Origin longitude
        dest_lat: Destination latitude
        dest_lon: Destination longitude
        api_key: Google Maps API key (optional)

    Returns:
        Tuple of (distance in km, error message if any)
    """
    if not api_key:
        return 0.0, "Google Maps API key not configured"

    try:
        async with httpx.AsyncClient() as client:
            url = "https://maps.googleapis.com/maps/api/distancematrix/json"
            params = {
                "origins": f"{origin_lat},{origin_lon}",
                "destinations": f"{dest_lat},{dest_lon}",
                "key": api_key,
                "mode": "driving"
            }
            response = await client.get(url, params=params, timeout=10.0)
            data = response.json()

            if data.get("status") == "OK":
                element = data["rows"][0]["elements"][0]
                if element.get("status") == "OK":
                    # Distance is returned in meters
                    distance_meters = element["distance"]["value"]
                    return distance_meters / 1000.0, None

            return 0.0, f"Google Maps API error: {data.get('status', 'Unknown')}"
    except Exception as e:
        return 0.0, str(e)


def calculate_distance(
    origin_lat: float, origin_lon: float,
    dest_lat: float, dest_lon: float,
    use_google_maps: bool = False,
    api_key: Optional[str] = None
) -> float:
    """
    Calculate distance between two points.

    Args:
        origin_lat: Origin latitude
        origin_lon: Origin longitude
        dest_lat: Destination latitude
        dest_lon: Destination longitude
        use_google_maps: Whether to use Google Maps API (if available)
        api_key: Google Maps API key

    Returns:
        Distance in kilometers
    """
    if use_google_maps and api_key:
        # For synchronous context, we use httpx's sync client
        # In an async context, use calculate_distance_with_google_maps
        try:
            import googlemaps
            gmaps = googlemaps.Client(key=api_key)
            result = gmaps.distance_matrix(
                origins=(origin_lat, origin_lon),
                destinations=(dest_lat, dest_lon),
                mode="driving"
            )
            if result["status"] == "OK":
                element = result["rows"][0]["elements"][0]
                if element["status"] == "OK":
                    return element["distance"]["value"] / 1000.0
        except Exception:
            pass

    # Fallback to Haversine formula
    return calculate_haversine_distance(origin_lat, origin_lon, dest_lat, dest_lon)


def calculate_eta(distance_km: float, speed_kmh: float = AVERAGE_DELIVERY_SPEED_KMH) -> datetime:
    """
    Calculate estimated time of arrival.

    Args:
        distance_km: Distance in kilometers
        speed_kmh: Average speed in km/h (default: 25 km/h for city delivery)

    Returns:
        Estimated arrival time as datetime
    """
    if distance_km <= 0:
        return datetime.utcnow()

    # Calculate time in hours
    time_hours = distance_km / speed_kmh
    # Convert to minutes and add some buffer for pickup
    time_minutes = int(time_hours * 60) + 5  # 5 minute buffer for pickup

    return datetime.utcnow() + timedelta(minutes=time_minutes)


def calculate_earnings(distance_km: float) -> float:
    """
    Calculate rider earnings based on distance.

    Args:
        distance_km: Distance in kilometers

    Returns:
        Earnings in currency units
    """
    if distance_km <= 0:
        return MIN_EARNINGS

    earnings = BASE_EARNINGS + (distance_km * PER_KM_RATE)
    return max(earnings, MIN_EARNINGS)