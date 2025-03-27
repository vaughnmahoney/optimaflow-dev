
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';
import { format, getDay, subDays } from 'https://esm.sh/date-fns@2.30.0';

// Create a Supabase client with the admin role
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// OptimoRoute API key
const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY');

// Get the Monday of the current week
function getMondayOfCurrentWeek(): Date {
  const now = new Date();
  const currentDay = getDay(now); // 0 for Sunday, 1 for Monday, etc.
  
  // If today is Sunday (0), go back 6 days to get to Monday
  // If today is Monday (1), go back 0 days
  // If today is Tuesday (2), go back 1 day, etc.
  const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
  
  return subDays(now, daysToSubtract);
}

// Fetch orders for the specific date
async function fetchOrders(date: string): Promise<any> {
  try {
    console.log(`Fetching orders for date: ${date}`);
    
    // Call the get-orders-with-completion function
    const { data, error } = await adminClient.functions.invoke('get-orders-with-completion', {
      body: {
        startDate: date,
        endDate: date,
        validStatuses: ['success', 'failed', 'rejected']
      }
    });
    
    if (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in fetchOrders:', error);
    return { success: false, error: String(error) };
  }
}

// Import orders to the database
async function importOrders(orders: any[]): Promise<any> {
  try {
    if (!orders || orders.length === 0) {
      return { success: true, imported: 0, duplicates: 0, errors: 0 };
    }
    
    console.log(`Importing ${orders.length} orders to database...`);
    
    // Call the import-bulk-orders function
    const { data, error } = await adminClient.functions.invoke('import-bulk-orders', {
      body: { orders }
    });
    
    if (error) {
      throw new Error(`Error importing orders: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error in importOrders:', error);
    return { success: false, error: String(error) };
  }
}

// Log function execution
async function logExecution(result: any): Promise<void> {
  try {
    const { data, error } = await adminClient
      .from('auto_import_logs')
      .insert({
        execution_time: new Date().toISOString(),
        result: result
      });
      
    if (error) {
      console.error('Error logging execution:', error);
    }
  } catch (error) {
    console.error('Error in logExecution:', error);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the Monday of the current week
    const monday = getMondayOfCurrentWeek();
    const formattedDate = format(monday, 'yyyy-MM-dd');
    
    console.log(`Starting automated import for Monday (${formattedDate})`);
    
    // 1. Fetch orders for Monday
    const fetchResult = await fetchOrders(formattedDate);
    
    if (!fetchResult.success) {
      const errorResult = { 
        success: false, 
        date: formattedDate,
        error: fetchResult.error,
        message: 'Failed to fetch orders'
      };
      
      await logExecution(errorResult);
      
      return new Response(
        JSON.stringify(errorResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Extract orders from the fetch result
    const orders = fetchResult.data.orders || [];
    console.log(`Retrieved ${orders.length} orders for ${formattedDate}`);
    
    // 2. Import the orders to the database
    const importResult = await importOrders(orders);
    
    // 3. Prepare the response
    const result = { 
      success: importResult.success !== false, 
      date: formattedDate,
      fetched: orders.length,
      imported: importResult.imported || 0,
      duplicates: importResult.duplicates || 0,
      errors: importResult.errors || 0,
      timestamp: new Date().toISOString()
    };
    
    // 4. Log the execution result
    await logExecution(result);
    
    // 5. Return the response
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Unhandled error in auto-import-orders:', error);
    
    const errorResult = { 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
    
    await logExecution(errorResult);
    
    return new Response(
      JSON.stringify(errorResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
