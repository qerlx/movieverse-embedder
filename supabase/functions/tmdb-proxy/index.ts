import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { path, params } = await req.json()
    
    // Get TMDB API key from Supabase secrets
    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY')
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY not configured')
    }

    // Construct the TMDB API URL
    const url = new URL(`https://api.themoviedb.org/3/${path}`)
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    // Make request to TMDB API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${TMDB_API_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Internal server error',
        details: 'Failed to proxy TMDB request'
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})