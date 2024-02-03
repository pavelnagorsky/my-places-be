import { CookieOptions } from 'express';

export const cookieConfig: CookieOptions = {
  httpOnly: true,
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90d
  sameSite: 'none',
  secure: true,
};
