from datetime import datetime, timedelta
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.database import get_db

settings = get_settings()

# Use demo_models in demo mode
if settings.demo_mode:
    from app.demo_models.user import Address, User
    from app.demo_models.long_order import (
        LongOrderCategory,
        LongOrderItem,
        LongOrder,
        LongOrderOrderItem,
    )
else:
    from app.models.long_order import (
        LongOrderCategory,
        LongOrderItem,
        LongOrder,
        LongOrderOrderItem,
    )
    from app.models.user import Address, User

from app.api.v1.deps import get_current_user
from app.core.exceptions import BadRequestException, NotFoundException
from app.schemas.long_order import (
    LongOrderCartEstimateResponse,
    LongOrderCartItemRequest,
    LongOrderCartValidationRequest,
    LongOrderCartValidationResponse,
    LongOrderCategoryResponse,
    LongOrderCreateRequest,
    LongOrderItemBrief,
    LongOrderItemResponse,
    LongOrderBrief,
    LongOrderResponse,
)

router = APIRouter()


def generate_order_number() -> str:
    """Generate unique long order number."""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_suffix = str(uuid4())[:4].upper()
    return f"LO{timestamp}{random_suffix}"


@router.get("/categories", response_model=list[LongOrderCategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
):
    """List all active long order categories."""
    result = await db.execute(
        select(LongOrderCategory)
        .where(LongOrderCategory.is_active == True)  # noqa: E712
        .order_by(LongOrderCategory.sort_order)
    )
    categories = result.scalars().all()

    items_count_query = await db.execute(
        select(LongOrderItem.category_id, func.count(LongOrderItem.id))
        .group_by(LongOrderItem.category_id)
    )
    items_count_map = {cat_id: count for cat_id, count in items_count_query.all()}

    return [
        LongOrderCategoryResponse(
            id=cat.id,
            name=cat.name,
            description=cat.description,
            image_url=cat.image_url,
            sort_order=cat.sort_order,
            is_active=cat.is_active,
            items_count=items_count_map.get(cat.id, 0),
        )
        for cat in categories
    ]


@router.get("/items", response_model=list[LongOrderItemResponse])
async def list_items(
    category_id: UUID | None = Query(None),
    is_bestseller: bool | None = Query(None),
    is_available: bool | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List long order items with filters."""
    query = select(LongOrderItem)

    if category_id:
        query = query.where(LongOrderItem.category_id == category_id)
    if is_bestseller is not None:
        query = query.where(LongOrderItem.is_bestseller == is_bestseller)
    if is_available is not None:
        query = query.where(LongOrderItem.is_available == is_available)
    else:
        query = query.where(LongOrderItem.is_available == True)  # noqa: E712

    query = query.order_by(LongOrderItem.is_bestseller.desc(), LongOrderItem.name)
    query = query.limit(limit)

    result = await db.execute(query)
    items = result.scalars().all()

    return [LongOrderItemResponse.model_validate(item) for item in items]


@router.get("/items/{item_id}", response_model=LongOrderItemResponse)
async def get_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get long order item details."""
    result = await db.execute(
        select(LongOrderItem).where(LongOrderItem.id == item_id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise NotFoundException("Item not found")

    return item


@router.get("/cart/estimate", response_model=LongOrderCartEstimateResponse)
async def get_cart_estimate(
    items: list[LongOrderCartItemRequest],
    address_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get delivery estimate for cart items."""
    item_ids = [item.item_id for item in items]
    result = await db.execute(
        select(LongOrderItem).where(LongOrderItem.id.in_(item_ids))
    )
    items_map = {item.id: item for item in result.scalars().all()}

    max_prep_days = 0
    subtotal = 0.0

    for cart_item in items:
        item = items_map.get(cart_item.item_id)
        if item:
            max_prep_days = max(max_prep_days, item.preparation_days)
            subtotal += item.price * cart_item.quantity

    estimated_delivery_date = datetime.utcnow() + timedelta(days=max_prep_days + 2)
    delivery_fee = 50.0 if subtotal < 500 else 0.0
    total_amount = subtotal + delivery_fee

    return LongOrderCartEstimateResponse(
        max_preparation_days=max_prep_days,
        estimated_delivery_date=estimated_delivery_date,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
    )


@router.post("/cart/validate", response_model=LongOrderCartValidationResponse)
async def validate_cart(
    request: LongOrderCartValidationRequest,
    db: AsyncSession = Depends(get_db),
):
    """Validate long order cart before checkout."""
    errors = []
    max_prep_days = 0
    subtotal = 0.0

    item_ids = [item.item_id for item in request.items]
    result = await db.execute(
        select(LongOrderItem).where(LongOrderItem.id.in_(item_ids))
    )
    items_map = {item.id: item for item in result.scalars().all()}

    for cart_item in request.items:
        item = items_map.get(cart_item.item_id)
        if not item:
            errors.append(f"Item {cart_item.item_id} not found")
            continue

        if not item.is_available:
            errors.append(f"{item.name} is not available")
            continue

        if item.stock_quantity < cart_item.quantity:
            errors.append(f"{item.name} has only {item.stock_quantity} in stock")

        max_prep_days = max(max_prep_days, item.preparation_days)
        subtotal += item.price * cart_item.quantity

    estimated_delivery_date = datetime.utcnow() + timedelta(days=max_prep_days + 2)
    delivery_fee = 50.0 if subtotal < 500 else 0.0
    total_amount = subtotal + delivery_fee

    return LongOrderCartValidationResponse(
        is_valid=len(errors) == 0,
        errors=errors,
        max_preparation_days=max_prep_days,
        estimated_delivery_date=estimated_delivery_date,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
    )


@router.post("/orders", response_model=LongOrderResponse)
async def create_order(
    request: LongOrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new long order."""
    # Validate address
    result = await db.execute(
        select(Address).where(
            Address.id == request.address_id,
            Address.user_id == current_user.id,
        )
    )
    address = result.scalar_one_or_none()
    if not address:
        raise NotFoundException("Address not found")

    # Get items and validate
    item_ids = [item.item_id for item in request.items]
    result = await db.execute(
        select(LongOrderItem).where(LongOrderItem.id.in_(item_ids))
    )
    items_map = {item.id: item for item in result.scalars().all()}

    max_prep_days = 0
    subtotal = 0.0
    order_items = []

    for cart_item in request.items:
        item = items_map.get(cart_item.item_id)
        if not item:
            raise BadRequestException(f"Item {cart_item.item_id} not found")

        if not item.is_available:
            raise BadRequestException(f"{item.name} is not available")

        if item.stock_quantity < cart_item.quantity:
            raise BadRequestException(
                f"{item.name} has only {item.stock_quantity} in stock"
            )

        max_prep_days = max(max_prep_days, item.preparation_days)
        item_subtotal = item.price * cart_item.quantity
        subtotal += item_subtotal

        order_items.append({
            "item_id": item.id,
            "item_name": item.name,
            "item_price": item.price,
            "quantity": cart_item.quantity,
            "subtotal": item_subtotal,
        })

        # Decrease stock
        item.stock_quantity -= cart_item.quantity

    delivery_fee = 50.0 if subtotal < 500 else 0.0
    total_amount = subtotal + delivery_fee
    estimated_delivery_date = datetime.utcnow() + timedelta(days=max_prep_days + 2)

    # Create order
    order = LongOrder(
        order_number=generate_order_number(),
        customer_id=current_user.id,
        address_id=address.id,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
        status="pending",
        payment_method=request.payment_method,
        payment_status="pending",
        estimated_delivery_date=estimated_delivery_date,
    )
    db.add(order)
    await db.flush()

    # Create order items
    for item_data in order_items:
        order_item = LongOrderOrderItem(order_id=order.id, **item_data)
        db.add(order_item)

    await db.commit()
    await db.refresh(order)

    return order


@router.get("/orders", response_model=list[LongOrderBrief])
async def list_orders(
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's long orders."""
    query = select(LongOrder).where(LongOrder.customer_id == current_user.id)

    if status:
        query = query.where(LongOrder.status == status)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    query = (
        query.offset((page - 1) * limit)
        .limit(limit)
        .order_by(LongOrder.created_at.desc())
    )
    result = await db.execute(query.options(selectinload(LongOrder.items)))
    orders = result.scalars().all()

    return [
        LongOrderBrief(
            id=order.id,
            order_number=order.order_number,
            status=order.status,
            total_amount=order.total_amount,
            items_count=len(order.items) if order.items else 0,
            estimated_delivery_date=order.estimated_delivery_date,
            created_at=order.created_at,
        )
        for order in orders
    ]


@router.get("/orders/{order_id}", response_model=LongOrderResponse)
async def get_order(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get long order details."""
    result = await db.execute(
        select(LongOrder)
        .options(selectinload(LongOrder.items))
        .where(LongOrder.id == order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise NotFoundException("Order not found")

    if order.customer_id != current_user.id:
        raise NotFoundException("Order not found")

    return order


@router.post("/orders/{order_id}/cancel")
async def cancel_order(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a long order (only if not yet shipped)."""
    result = await db.execute(
        select(LongOrder).where(LongOrder.id == order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise NotFoundException("Order not found")

    if order.customer_id != current_user.id:
        raise NotFoundException("Order not found")

    if order.status in ["shipped", "delivered", "cancelled"]:
        raise BadRequestException(f"Cannot cancel order in {order.status} status")

    order.status = "cancelled"
    order.cancelled_at = datetime.utcnow()

    # Restore stock
    for order_item in order.items:
        result = await db.execute(
            select(LongOrderItem).where(LongOrderItem.id == order_item.item_id)
        )
        item = result.scalar_one_or_none()
        if item:
            item.stock_quantity += order_item.quantity

    await db.commit()

    return {"message": "Order cancelled successfully"}
