
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY')
const baseUrl = 'https://api.optimoroute.com/v1'

interface OptimoRouteError {
  error: string;
  message: string;
  code: number;
}

interface SearchParams {
  searchQuery: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
        continue;
      }

      // Handle other errors
      if (!response.ok) {
        const error = await response.json() as OptimoRouteError;
        throw new Error(`OptimoRoute API error: ${error.message}`);
      }

      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries reached');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchQuery, fromDate, toDate, status }: SearchParams = await req.json()
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      key: optimoRouteApiKey!,
      ...(fromDate && { from: fromDate }),
      ...(toDate && { to: toDate }),
      ...(status && { status })
    });

    const url = `${baseUrl}/orders/${searchQuery}?${queryParams}`;
    console.log('Fetching from URL:', url);
    
    const response = await fetchWithRetry(
      url,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    console.log('OptimoRoute API response:', data);

    // Validate response data
    if (!data || (Array.isArray(data.orders) && !data.orders.length)) {
      console.log('No orders found in response');
      return new Response(
        JSON.stringify({ 
          error: 'No orders found',
          success: false,
          data: null
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Successfully processed order data');
    return new Response(
      JSON.stringify({ 
        data,
        success: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in edge function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        code: error.code || 500
      }),
      { 
        status: error.code || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
