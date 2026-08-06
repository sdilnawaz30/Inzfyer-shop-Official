import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { password } = req.body;

  // Ideally this should be a hashed password in the DB. For now we use the env variable.
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password !== adminPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_please_change';
  
  const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '1h' });

  const cookieStr = serialize('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookieStr);
  return res.status(200).json({ success: true, message: 'Logged in successfully' });
}
