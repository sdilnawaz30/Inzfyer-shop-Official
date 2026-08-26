-- Seed categories for INZFYER
INSERT INTO categories (name, slug) VALUES 
('Plushies & Toys', 'plushies-and-toys'),
('Keychains & Charms', 'keychains-and-charms'),
('Luxury Gift Sets', 'luxury-gift-sets'),
('Boutique Ceramics', 'boutique-ceramics'),
('Aesthetic Stationery', 'aesthetic-stationery'),
('Baby Keepsakes', 'baby-keepsakes')
ON CONFLICT (slug) DO NOTHING;
