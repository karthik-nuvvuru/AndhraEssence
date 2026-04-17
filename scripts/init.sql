-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'restaurant_owner', 'rider', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'pending', 'confirmed', 'preparing', 'ready',
        'picked_up', 'in_transit', 'delivered',
        'cancelled', 'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('razorpay', 'wallet', 'cod');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
