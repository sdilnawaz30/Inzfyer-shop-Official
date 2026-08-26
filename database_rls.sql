-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- 1. Enable RLS on every application table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 2. Helper Function for Authorization
-- This function securely checks if the current authenticated user has the 'admin' role in the profiles table.
-- Using SECURITY DEFINER so it can execute bypassing the RLS on the profiles table if necessary.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- POLICIES
-- ==========================================

-- PROFILES
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (is_admin());
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES
CREATE POLICY "Public can read active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (is_admin());

-- PRODUCTS
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin());

-- PRODUCT IMAGES
CREATE POLICY "Public can read product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON product_images FOR ALL USING (is_admin());

-- ORDERS
-- Admins can do anything
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (is_admin());
-- Public users can create orders (checkout process)
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
-- To read their own order, they need to know the id or have a user_id, but the schema doesn't tie orders to a user account securely.
-- Thus, public users cannot SELECT or UPDATE orders.

-- ORDER ITEMS
-- Admins can do anything
CREATE POLICY "Admins can manage order items" ON order_items FOR ALL USING (is_admin());
-- Public users can create order items
CREATE POLICY "Public can create order items" ON order_items FOR INSERT WITH CHECK (true);
