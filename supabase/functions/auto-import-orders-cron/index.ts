
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';
import { corsHeaders } from '../_shared/cors.ts';

// Create a Supabase client with the admin role
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Auto-import-orders-cron triggered');

    // Call the auto-import-orders function
    const { data, error } = await adminClient.functions.invoke('auto-import-orders');
    
    if (error) {
      console.error('Error triggering auto-import-orders:', error);
      throw error;
    }
    
    console.log('Auto-import-orders completed successfully:', data);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Auto-import-orders triggered successfully',
        result: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in auto-import-orders-cron:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
