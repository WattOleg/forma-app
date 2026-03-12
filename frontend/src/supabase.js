import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ycndqhsfwzsjoiyvyyjh.supabase.co'
const supabaseKey = 'вставь_anon_public_ключ'

export const supabase = createClient(supabaseUrl, supabaseKey)