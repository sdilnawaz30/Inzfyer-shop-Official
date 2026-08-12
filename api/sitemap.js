import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).send('Supabase credentials not found.');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch active products
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true);

    // Fetch active categories
    const { data: categories } = await supabase
      .from('categories')
      .select('name, updated_at')
      .eq('is_active', true);

    const baseUrl = 'https://www.inzfyer.in';

    // Base routes
    const routes = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/shop', priority: '0.9', changefreq: 'daily' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static routes
    for (const route of routes) {
      xml += `
  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    }

    // Product routes
    if (products) {
      for (const product of products) {
        xml += `
  <url>
    <loc>${baseUrl}/product/${encodeURIComponent(product.slug)}</loc>
    <lastmod>${new Date(product.updated_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }

    // Category routes
    if (categories) {
      for (const category of categories) {
        const categorySlug = encodeURIComponent(category.name);
        xml += `
  <url>
    <loc>${baseUrl}/category/${categorySlug}</loc>
    <lastmod>${new Date(category.updated_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }

    xml += `\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}
