import { Hono } from 'hono'
import {createClient,SupabaseClient} from '@supabase/supabase-js'

type Env = {
  Bindings: {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
  }
}

const app = new Hono<Env>()

app.get('/memos', async (c) => {
  try {
    const supabase: SupabaseClient = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY
    )

    const { data, error } = await supabase.from('memos').select('*')
    if (error) {
      return c.json({ error: error.message }, 500)
    }
    return c.json({ memos: data })
  } catch (e) {
    return c.json({ error: String(e) }, 500)
  }
})

app.get('/memos/:id', async (c) => {
  try {
    const supabase: SupabaseClient = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY
    )

    const { data, error } = await supabase.from('memos').select('*').eq('id', c.req.param('id')).single()
    if (error) {
      return c.json({ error: error.message }, 500)
    }
    return c.json({ memos: data })
  } catch (e) {
    return c.json({ error: String(e) }, 500)
  }
})

app.post('/memos', async (c) => {
  try {
    const supabase: SupabaseClient = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY
    )

    const body = await c.req.json()
    const { data, error } = await supabase.from('memos').insert({title:body.title}).select()
    if (error) {
      return c.json({ error: error.message }, 500)
    }
    return c.json({ data })
  } catch (e) {
    return c.json({ error: String(e) }, 500)
  }
})

app.put('/memos/:id', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )
  
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const { data, error } = await supabase
    .from('memos')
    .update({ title: body.title })
    .eq('id', id)
    .select()
    
  if (error) {
    return c.json({ error: error.message }, 500)
  }
  
  return c.json({ data })
})

app.delete('/memos/:id', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )
  
  const id = c.req.param('id')
  
  const { error } = await supabase
    .from('memos')
    .delete()
    .eq('id', id)
    
  if (error) {
    return c.json({ error: error.message }, 500)
  }
  
  return c.json({ message: '削除しました' })
})


export default app
