from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

from app.database import get_db
from app.config import get_settings
settings = get_settings()

# Use demo_models in demo mode
if settings.demo_mode:
    from app.demo_models.user import User
    from app.demo_models.order import Order
    from app.demo_models.payment import Payment
else:
    from app.models.user import User
    from app.models.order import Order
    from app.models.payment import Payment

from app.schemas.payment import (
    RazorpayOrderCreate, RazorpayOrderResponse, RazorpayVerify, PaymentResponse
)
from app.core.security import decode_token, oauth2_scheme
from app.core.exceptions import NotFoundException, ForbiddenException, UnauthorizedException, BadRequestException, PaymentFailedException
from app.core.enums import PaymentStatus, PaymentMethod
from app.api.v1.deps import get_current_user

router = APIRouter()

# Initialize Razorpay client lazily
razorpay_client = None


def get_razorpay_client():
    global razorpay_client
    if razorpay_client is None:
        import razorpay
        razorpay_client = razorpay.Client(
            auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
        )
    return razorpay_client


@router.post("/create-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(
    payment_data: RazorpayOrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a Razorpay order for payment."""
    # Verify order exists and belongs to user
    result = await db.execute(
        select(Order).where(Order.id == payment_data.order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise NotFoundException("Order not found")

    if order.customer_id != current_user.id:
        raise ForbiddenException("Access denied")

    if order.payment_status != PaymentStatus.PENDING:
        raise BadRequestException("Order is not pending payment")

    try:
        client = get_razorpay_client()
        razorpay_order = client.order.create({
            "amount": int(payment_data.amount * 100),  # Convert to paise
            "currency": payment_data.currency,
            "receipt": order.order_number,
            "notes": {
                "order_id": str(order.id),
                "customer_id": str(current_user.id)
            }
        })

        # Update order with razorpay order id
        order.razorpay_order_id = razorpay_order["id"]
        await db.commit()

        return RazorpayOrderResponse(
            id=razorpay_order["id"],
            entity=razorpay_order["entity"],
            amount=razorpay_order["amount"],
            currency=razorpay_order["currency"],
            status=razorpay_order["status"],
            receipt=razorpay_order.get("receipt")
        )

    except Exception as e:
        raise PaymentFailedException(f"Failed to create payment order: {str(e)}")


@router.post("/verify")
async def verify_payment(
    verification: RazorpayVerify,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify Razorpay payment signature."""
    # Find order by razorpay order id
    result = await db.execute(
        select(Order).where(Order.razorpay_order_id == verification.razorpay_order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise NotFoundException("Order not found")

    if order.customer_id != current_user.id:
        raise ForbiddenException("Access denied")

    try:
        client = get_razorpay_client()

        # Verify signature
        params_dict = {
            "razorpay_order_id": verification.razorpay_order_id,
            "razorpay_payment_id": verification.razorpay_payment_id,
            "razorpay_signature": verification.razorpay_signature
        }
        client.utility.verify_payment_signature(params_dict)

        # Update order payment status
        order.razorpay_payment_id = verification.razorpay_payment_id
        order.razorpay_signature = verification.razorpay_signature
        order.payment_status = PaymentStatus.COMPLETED

        # Create payment record
        payment = Payment(
            order_id=order.id,
            user_id=current_user.id,
            amount=order.total_amount,
            status=PaymentStatus.COMPLETED,
            payment_method="razorpay",
            razorpay_order_id=verification.razorpay_order_id,
            razorpay_payment_id=verification.razorpay_payment_id
        )
        db.add(payment)

        await db.commit()

        return {"success": True, "message": "Payment verified successfully"}

    except Exception as e:
        order.payment_status = PaymentStatus.FAILED
        await db.commit()
        raise PaymentFailedException(f"Payment verification failed: {str(e)}")


@router.post("/webhook")
async def razorpay_webhook(
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    """Handle Razorpay webhooks."""
    from app.models.order import Order
    from app.core.enums import OrderStatus
    from app.workers.tasks import send_order_notification
    import hmac
    import hashlib

    settings = get_settings()

    # Verify webhook signature if secret is configured
    if settings.razorpay_webhook_secret:
        webhook_signature = payload.get("razorpay_signature", "")
        webhook_body = payload.get("payload", {}).get("payment", {})

        if webhook_body:
            # Construct expected signature
            computed_signature = hmac.new(
                settings.razorpay_webhook_secret.encode(),
                str(webhook_body).encode(),
                hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(webhook_signature, computed_signature):
                raise UnauthorizedException("Invalid webhook signature")

    # Handle different webhook events
    event = payload.get("event")
    entity = payload.get("payload", {}).get("payment", {})

    if not event or not entity:
        return {"success": True, "message": "No event to process"}

    razorpay_payment_id = entity.get("id")
    razorpay_order_id = entity.get("order_id")
    status = entity.get("status")

    # Find order by razorpay order id
    result = await db.execute(
        select(Order).where(Order.razorpay_order_id == razorpay_order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        logger.warning(f"Order not found for webhook: {razorpay_order_id}")
        return {"success": True, "message": "Order not found"}

    # Handle payment events
    if event == "payment.captured":
        order.payment_status = PaymentStatus.COMPLETED
        # Send notification
        send_order_notification.delay(str(order.id), "payment_completed")

    elif event == "payment.failed":
        order.payment_status = PaymentStatus.FAILED
        send_order_notification.delay(str(order.id), "payment_failed")

    elif event == "refund.created":
        order.payment_status = PaymentStatus.REFUNDED
        send_order_notification.delay(str(order.id), "refund_processed")

    await db.commit()

    logger.info(f"Processed webhook event {event} for order {order.order_number}")
    return {"success": True, "message": f"Processed {event}"}
