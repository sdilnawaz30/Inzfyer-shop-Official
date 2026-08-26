-- Supabase RLS Policies for INZFYER
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Products Table
-- Allow public read access to all products
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
-- Allow only authenticated service role to insert/update/delete (or admin via backend)
CREATE POLICY "Allow service role insert on products" ON products FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service role update on products" ON products FOR UPDATE TO service_role USING (true);
CREATE POLICY "Allow service role delete on products" ON products FOR DELETE TO service_role USING (true);

-- Categories Table
-- Allow public read access to all categories
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
-- Allow only authenticated service role to insert/update/delete
CREATE POLICY "Allow service role insert on categories" ON categories FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service role update on categories" ON categories FOR UPDATE TO service_role USING (true);
CREATE POLICY "Allow service role delete on categories" ON categories FOR DELETE TO service_role USING (true);

-- Product Images Table
-- Allow public read access
CREATE POLICY "Allow public read access on product_images" ON product_images FOR SELECT USING (true);
-- Allow only authenticated service role to insert/update/delete
CREATE POLICY "Allow service role insert on product_images" ON product_images FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service role update on product_images" ON product_images FOR UPDATE TO service_role USING (true);
CREATE POLICY "Allow service role delete on product_images" ON product_images FOR DELETE TO service_role USING (true);

-- Orders Table
-- Allow service role full access
CREATE POLICY "Allow service role full access on orders" ON orders FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Optionally, allow authenticated users to read their own orders if you implement user accounts
-- CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
-- Allow insert from public/anon for checkout (if checkout is done from frontend) or only via service role if checkout is backend
-- Since checkout is currently frontend, we might need an insert policy, but if we move it to backend later, we remove it.
-- Let's restrict insert to service role if we are routing checkout through backend, else we must allow anon insert for now:
CREATE POLICY "Allow anon insert on orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
-- NOTE: We should eventually move order creation to a secure backend endpoint too.

-- Order Items Table
-- Allow service role full access
CREATE POLICY "Allow service role full access on order_items" ON order_items FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Allow anon insert (for checkout)
CREATE POLICY "Allow anon insert on order_items" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Inventory Movements Table
-- Allow service role full access
CREATE POLICY "Allow service role full access on inventory_movements" ON inventory_movements FOR ALL TO service_role USING (true) WITH CHECK (true);

-- NOTE: All DELETE operations from browser are blocked by default since we only allowed service_role for modifications.
