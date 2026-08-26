-- Add base price and tax split columns to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS base_subtotal NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS igst_amount NUMERIC(10, 2) DEFAULT 0;

-- Add base price and tax split columns to order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS igst_amount NUMERIC(10, 2) DEFAULT 0;
