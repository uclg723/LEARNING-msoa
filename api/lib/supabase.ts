import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const url = process.env.VITE_SUPABASE_URL as string | undefined
const anonKey = process.env.VITE_SUPABASE_ANON_KEY as string | undefined
const serviceKey = process.env.SUPABASE_SERVICE_KEY as string | undefined

if (!url) {
  console.warn('Missing VITE_SUPABASE_URL in environment')
}
if (!anonKey) {
  console.warn('Missing VITE_SUPABASE_ANON_KEY in environment')
}
if (!serviceKey) {
  console.warn('Missing SUPABASE_SERVICE_KEY in environment')
}

export const supabaseAnon = url && anonKey ? createClient(url, anonKey) : { auth: { signInWithPassword: () => ({ error: { message: 'Supabase not configured' } }) } } as any
export const supabaseAdmin = url && serviceKey ? createClient(url, serviceKey) : { auth: { admin: { createUser: () => ({ error: { message: 'Supabase not configured' } }) } } } as any
