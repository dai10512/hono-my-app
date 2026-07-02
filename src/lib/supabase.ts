import { createClient } from '@supabase/supabase-js';
import type { Context } from 'hono';
import type { Env } from '../types';

export const getSupabase = (c: Context<Env>) =>
  createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
