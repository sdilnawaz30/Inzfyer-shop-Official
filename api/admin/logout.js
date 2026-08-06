import { serialize } from 'cookie';

export default async function handler(req, res) {
  const cookieStr = serialize('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });

  res.setHeader('Set-Cookie', cookieStr);
  return res.status(200).json({ success: true });
}
