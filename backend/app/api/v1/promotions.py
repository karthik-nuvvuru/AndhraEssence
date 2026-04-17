from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Optional
import logging

from app.database import get_db
from app.config import get_settings
settings = get_settings()

# Use demo_models in demo mode
if settings.demo_mode:
    from app.demo_models.user import User
    from app.demo_models.payment import Promotion
else:
    from app.models.user import User
    from app.models.payment import Promotion

from app.schemas.payment import ApplyPromoCode, PromotionResponse
from app.core.security import decode_token, oauth2_scheme
from app.core.exceptions import NotFoundException, BadRequestException
from app.core.enums import UserRole

logger = logging.getLogger(__name__)

router = APIRouter()


async def get_current_user_dependency(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not token:
        raise BadRequestException("Not authenticated")
    payload = decode_token(token)
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")
    return user


def calculate_discount(promotion: Promotion, order_amount: float) -> float:
    """Calculate the discount amount based on promotion type."""
    if promotion.discount_type == "percentage":
        discount = order_amount * (promotion.discount_value / 100)
        if promotion.maximum_discount is not None:
            discount = min(discount, promotion.maximum_discount)
    else:  # fixed
        discount = promotion.discount_value

    # Ensure discount does not exceed order amount
    return round(min(discount, order_amount), 2)


@router.post("/validate", response_model=dict)
async def validate_promo_code(
    promo_data: ApplyPromoCode,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Validate a promo code and return the discount amount.

    Returns:
        - valid: bool indicating if the code is valid
        - code: the promo code
        - discount_amount: the discount to apply
        - message: description of the result
    """
    code = promo_data.code.upper().strip()
    order_amount = promo_data.order_amount

    # Find the promotion by code
    result = await db.execute(
        select(Promotion).where(Promotion.code == code)
    )
    promotion = result.scalar_one_or_none()

    # Check if promotion exists
    if not promotion:
        raise BadRequestException("Invalid promo code")

    # Check if promotion is active
    if not promotion.is_active:
        raise BadRequestException("This promo code is no longer active")

    # Check validity period
    now = datetime.utcnow()
    if now < promotion.valid_from:
        raise BadRequestException("This promo code is not yet valid")
    if now > promotion.valid_until:
        raise BadRequestException("This promo code has expired")

    # Check maximum uses
    if promotion.maximum_uses is not None and promotion.current_uses >= promotion.maximum_uses:
        raise BadRequestException("This promo code has reached its maximum uses")

    # Check minimum order amount
    if order_amount < promotion.minimum_order_amount:
        raise BadRequestException(
            f"Minimum order amount for this promo code is {promotion.minimum_order_amount}"
        )

    # Calculate discount
    discount_amount = calculate_discount(promotion, order_amount)

    return {
        "valid": True,
        "code": code,
        "discount_amount": discount_amount,
        "discount_type": promotion.discount_type,
        "description": promotion.description
    }


@router.get("/{code}", response_model=PromotionResponse)
async def get_promotion_details(
    code: str,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """Get promotion details by code (for admin/display purposes)."""
    code = code.upper().strip()

    result = await db.execute(
        select(Promotion).where(Promotion.code == code)
    )
    promotion = result.scalar_one_or_none()

    if not promotion:
        raise NotFoundException("Promo code not found")

    return promotion
