
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';
import { corsHeaders } from '../_shared/cors.ts';

// Create a Supabase client with the admin role
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  const execTime = new Date().toISOString();
  console.log(`[${execTime}] Auto-import-orders-cron triggered`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${execTime}] Handling OPTIONS request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${execTime}] Preparing to call auto-import-orders function`);

    // Call the auto-import-orders function
    console.log(`[${execTime}] Invoking auto-import-orders...`);
    const { data, error } = await adminClient.functions.invoke('auto-import-orders');
    
    if (error) {
      console.error(`[${execTime}] Error triggering auto-import-orders:`, error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || 'Failed to trigger auto-import',
          timestamp: execTime
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`[${execTime}] Auto-import-orders completed successfully:`, data);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Auto-import-orders triggered successfully',
        result: data,
        timestamp: execTime
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error(`[${execTime}] Error in auto-import-orders-cron:`, error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        timestamp: execTime
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
