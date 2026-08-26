import jwt from 'jsonwebtoken';

export const config = {
  api: {
    bodyParser: false, // Disabling body parser to stream the file directly
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const admin_session = req.cookies?.admin_session;

  if (!admin_session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_please_change';
    jwt.verify(admin_session, jwtSecret);
  } catch (error) {
    return res.status(401).json({ message: 'Session expired or invalid' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ message: 'Vercel Blob Storage is not configured (missing BLOB_READ_WRITE_TOKEN)' });
  }

  const filename = req.query.filename || `product-image-${Date.now()}.png`;

  try {
    const { put } = await import('@vercel/blob');
    const blob = await put(filename, req, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return res.status(200).json({ success: true, url: blob.url });
  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({ message: error.message || 'Image upload failed' });
  }
}
