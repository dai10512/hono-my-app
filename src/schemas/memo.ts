import { z } from '@hono/zod-openapi';

export const MemoSchema = z.object({
  id: z.string().openapi({ example: 'idhogehoge' }),
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, '100文字以内で入力してください')
    .openapi({ example: 'メモのタイトル' }),
});

export const CreateMemoSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, '100文字以内で入力してください')
    .openapi({ example: 'メモのタイトル' }),
});

