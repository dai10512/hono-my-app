import { createMiddleware } from 'hono/factory';
import { createClient } from '@supabase/supabase-js';
import type { Env } from '../types';

export const authMiddleware = createMiddleware<Env>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return c.json({ error: '認証が必要です' }, 401);
    }
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY,
    );
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return c.json({ error: 'トークンが無効です' }, 401);
    }
    return await next();
  },
);
