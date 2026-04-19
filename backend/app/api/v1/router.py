from fastapi import APIRouter

from app.api.v1 import (
    admin,
    auth,
    menu,
    notifications,
    orders,
    payments,
    promotions,
    restaurants,
    riders,
    users,
)

api_router = APIRouter()

# Include all v1 routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(
    restaurants.router, prefix="/restaurants", tags=["Restaurants"]
)
api_router.include_router(menu.router, prefix="/menu", tags=["Menu"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(riders.router, prefix="/riders", tags=["Riders"])
api_router.include_router(notifications.router, tags=["Notifications"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(promotions.router, prefix="/promotions", tags=["Promotions"])
