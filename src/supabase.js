import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ycndqhsfwzsjoiyvyyjh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbmRxaHNmd3pzam9peXZ5eWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTc4MDAsImV4cCI6MjA4ODczMzgwMH0.EI1NQDd7m3TWlbO_Gze_TvFHfS56K2K8V0Az49yTdrI'

export const supabase = createClient(supabaseUrl, supabaseKey)