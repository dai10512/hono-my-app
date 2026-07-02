import {
  createRoute,
  OpenAPIHono,
  z,
} from '@hono/zod-openapi';
import type { Env } from '../types';
import { getSupabase } from '../lib/supabase';
import { CreateMemoSchema, MemoSchema } from '../schemas/memo';

const MemoListSchema = z.object({
  data: z.array(MemoSchema),
  total: z.number().openapi({ example: 100 }),
  page: z.number().openapi({ example: 1 }),
  limit: z.number().openapi({ example: 20 }),
});

const getMemoRoute = createRoute({
  method: 'get',
  path: '/memos',
  request: {
    query: z.object({
      page: z
        .string()
        .optional()
        .openapi({ example: '1' }),
      limit: z
        .string()
        .optional()
        .openapi({ example: '20' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MemoListSchema,
        },
      },
      description: 'メモ一覧を取得しました',
    },
    401: { description: '認証が必要です' },
    500: { description: 'エラーが発生しました' },
  },
});

const getMemoDetailRoute = createRoute({
  method: 'get',
  path: '/memos/:id',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MemoSchema,
        },
      },
      description: 'メモを取得しました',
    },
    401: { description: '認証が必要です' },
    500: { description: 'エラーが発生しました' },
  },
});

const postMemoRoute = createRoute({
  method: 'post',
  path: '/memos',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateMemoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MemoSchema,
        },
      },
      description: 'メモを作成しました',
    },
    400: { description: 'リクエストが不正です' },
    401: { description: '認証が必要です' },
    500: { description: 'エラーが発生しました' },
  },
});

const putMemoRoute = createRoute({
  method: 'put',
  path: '/memos/:id',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateMemoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MemoSchema,
        },
      },
      description: 'メモを更新しました',
    },
    400: { description: 'リクエストが不正です' },
    401: { description: '認証が必要です' },
    500: { description: 'エラーが発生しました' },
  },
});

const deleteMemoRoute = createRoute({
  method: 'delete',
  path: '/memos/:id',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'メモを削除しました',
    },
    401: { description: '認証が必要です' },
    404: { description: 'メモが見つかりません' },
    500: { description: 'エラーが発生しました' },
  },
});

export const memosRoute = new OpenAPIHono<Env>();

memosRoute.openapi(getMemoRoute, async (c) => {
  const supabase = getSupabase(c);
  const page = Number(c.req.valid('query').page ?? '1');
  const limit = Number(c.req.valid('query').limit ?? '20');
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('memos')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1);

  if (error) {
    return c.json({ error: error.message }, 500);
  }
  return c.json(
    { data: data ?? [], total: count ?? 0, page, limit },
    200,
  );
});

memosRoute.openapi(getMemoDetailRoute, async (c) => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('id', c.req.param('id'))
    .single();
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  return c.json(data, 200);
});

memosRoute.openapi(postMemoRoute, async (c) => {
  const supabase = getSupabase(c);
  const { title } = c.req.valid('json');
  const { data, error } = await supabase
    .from('memos')
    .insert({ title })
    .select()
    .single();
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  return c.json(data, 200);
});

memosRoute.openapi(putMemoRoute, async (c) => {
  const supabase = getSupabase(c);
  const id = c.req.param('id');
  const { title } = c.req.valid('json');
  const { data, error } = await supabase
    .from('memos')
    .update({ title })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  return c.json(data, 200);
});

memosRoute.openapi(deleteMemoRoute, async (c) => {
  const supabase = getSupabase(c);
  const id = c.req.param('id');
  const { data: existing } = await supabase
    .from('memos')
    .select('id')
    .eq('id', id)
    .single();
  if (!existing) {
    return c.json({ error: 'メモが見つかりません' }, 404);
  }
  const { error } = await supabase
    .from('memos')
    .delete()
    .eq('id', id);
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  return c.json({ message: '削除しました' }, 200);
});
