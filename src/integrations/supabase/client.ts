import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://glrtytxdmfxowefodjux.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscnR5dHhkbWZ4b3dlZm9kanV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTg1OTksImV4cCI6MjA2NDgzNDU5OX0.LbsFWNntkukAaMPDrUcq4V7r93vOzSbJXIkFhKs8auA'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)