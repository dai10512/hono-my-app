import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from './middleware/auth';
import { memosRoute } from './routes/memos';
import type { Env } from './types';
import { swaggerUI } from '@hono/swagger-ui';

const app = new OpenAPIHono<Env>();

app.use('/memos/*', authMiddleware);
app.route('/', memosRoute);

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Hono + Supabase + Zod OpenAPI Example',
    version: '1.0.0',
  },
  servers: [{ url: 'http://localhost:8787' }],
});
app.get('/ui', swaggerUI({ url: '/doc' }));

export default app;
