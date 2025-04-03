import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';
import { format, getDay, startOfWeek, isAfter } from 'https://esm.sh/date-fns@2.30.0';

// Create a Supabase client with the admin role
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// OptimoRoute API key
const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY');

// Constants
const BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Get the Monday of the current week
function getMondayOfCurrentWeek(): Date {
  const now = new Date();
  // Use date-fns to get start of week (Monday)
  return startOfWeek(now, { weekStartsOn: 1 });
}

// Get the current date
function getCurrentDate(): Date {
  return new Date();
}

// Fetch orders with completion details for a specific date range
async function fetchOrdersWithCompletion(startDate: string, endDate: string, continuationToken?: string): Promise<any> {
  try {
    console.log(`Fetching orders from ${startDate} to ${endDate}${continuationToken ? ' with continuation token' : ''}`);
    
    // Call the get-orders-with-completion function which handles progressive loading
    const { data, error } = await adminClient.functions.invoke('get-orders-with-completion', {
      body: {
        startDate,
        endDate,
        validStatuses: ['success', 'failed', 'rejected'],
        batchSize: BATCH_SIZE,
        continuationToken
      }
    });
    
    if (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in fetchOrdersWithCompletion:', error);
    return { success: false, error: String(error) };
  }
}

// Import orders to the database using the import-bulk-orders endpoint
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

// Progressive loading of orders with retry mechanism
async function progressivelyLoadOrders(startDate: string, endDate: string): Promise<any> {
  let allOrders: any[] = [];
  let continuationToken: string | null = null;
  let isComplete = false;
  let currentPage = 0;
  let retryCount = 0;
  let totalFiltered = 0;
  
  const result = {
    success: true,
    totalFetched: 0,
    totalImported: 0,
    totalDuplicates: 0,
    totalErrors: 0,
    batchesProcessed: 0,
    errorDetails: []
  };
  
  // Loop until all pages are processed
  while (!isComplete) {
    try {
      // Fetch the current batch of orders
      const fetchResult = await fetchOrdersWithCompletion(startDate, endDate, continuationToken);
      
      if (!fetchResult.success) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Retry ${retryCount + 1}/${MAX_RETRIES} after error: ${fetchResult.error}`);
          retryCount++;
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount - 1)));
          continue;
        }
        
        throw new Error(`Failed to fetch orders after ${MAX_RETRIES} retries: ${fetchResult.error}`);
      }
      
      // Reset retry count on success
      retryCount = 0;
      currentPage++;
      
      const responseData = fetchResult.data;
      const batchOrders = responseData.orders || [];
      
      console.log(`Retrieved batch ${currentPage} with ${batchOrders.length} orders`);
      totalFiltered += batchOrders.length;
      
      // If we have orders in this batch, add them to our collection and import them
      if (batchOrders.length > 0) {
        allOrders = [...allOrders, ...batchOrders];
        
        // Make sure each order has optimoroute_status extracted from completion data
        const ordersWithOptimoRouteStatus = batchOrders.map(order => {
          // Extract optimoroute_status
          let optimoRouteStatus = null;
          
          // Check completion_response
          if (order.completion_response && typeof order.completion_response === 'object') {
            if (order.completion_response.orders && 
                Array.isArray(order.completion_response.orders) && 
                order.completion_response.orders[0]) {
              const completionOrder = order.completion_response.orders[0];
              if (completionOrder.data && completionOrder.data.status) {
                optimoRouteStatus = completionOrder.data.status;
              }
            }
            // Direct data property
            else if (order.completion_response.data && order.completion_response.data.status) {
              optimoRouteStatus = order.completion_response.data.status;
            }
          }
          
          // Check completionDetails if we didn't find it yet
          if (!optimoRouteStatus && order.completionDetails && typeof order.completionDetails === 'object') {
            if (order.completionDetails.data && order.completionDetails.data.status) {
              optimoRouteStatus = order.completionDetails.data.status;
            }
          }
          
          // Add the extracted optimoroute_status to the order
          return { ...order, optimoroute_status: optimoRouteStatus };
        });
        
        // Import this batch of orders with optimoroute_status
        const importResult = await importOrders(ordersWithOptimoRouteStatus);
        
        // Track the results
        if (importResult.success !== false) {
          result.totalImported += importResult.imported || 0;
          result.totalDuplicates += importResult.duplicates || 0;
          result.totalErrors += importResult.errors || 0;
        } else {
          result.totalErrors += batchOrders.length;
          result.errorDetails.push(`Batch ${currentPage} import error: ${importResult.error || 'Unknown error'}`);
        }
        
        result.batchesProcessed++;
      }
      
      // Check if we're done or need to continue
      if (responseData.isComplete === true || !responseData.continuationToken) {
        console.log('Completed fetching all orders');
        isComplete = true;
      } else {
        // Set the continuation token for the next batch
        continuationToken = responseData.continuationToken;
        console.log(`Continuing with next batch using token: ${continuationToken}`);
        
        // Optional: Add a small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error(`Error processing batch ${currentPage + 1}:`, error);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retry ${retryCount + 1}/${MAX_RETRIES}`);
        retryCount++;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount - 1)));
      } else {
        // Max retries exceeded, add to error details and break
        result.success = false;
        result.errorDetails.push(`Error processing batch ${currentPage + 1} after ${MAX_RETRIES} retries: ${error.message || String(error)}`);
        break;
      }
    }
  }
  
  result.totalFetched = totalFiltered;
  
  // Final success is based on errors
  result.success = result.errorDetails.length === 0;
  
  return result;
}

// Log function execution
async function logExecution(result: any): Promise<void> {
  try {
    // Create a clean result object for logging
    const logResult = {
      ...result,
      timestamp: new Date().toISOString()
    };
    
    console.log("Logging execution result:", logResult);
    
    const { data, error } = await adminClient
      .from('auto_import_logs')
      .insert({
        execution_time: new Date().toISOString(),
        result: logResult
      });
      
    if (error) {
      console.error('Error logging execution:', error);
    } else {
      console.log('Successfully logged execution result');
    }
  } catch (error) {
    console.error('Error in logExecution:', error);
  }
}

// Get the latest execution log
async function getLatestExecutionLog(): Promise<any> {
  try {
    const { data, error } = await adminClient
      .from('auto_import_logs')
      .select('*')
      .order('execution_time', { ascending: false })
      .limit(1);
      
    if (error) {
      throw error;
    }
    
    return { success: true, data: data?.[0] || null };
  } catch (error) {
    console.error('Error fetching latest execution log:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Calculate next scheduled run time
function getNextScheduledRunTime(): string {
  const now = new Date();
  // Set the hour to the next hour and minutes/seconds to 0
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  
  return nextHour.toISOString();
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Get the URL to determine if this is a status request
  const url = new URL(req.url);
  const path = url.pathname;
  const isStatusRequest = path.endsWith('/status');
  
  console.log(`Request received for path: ${path}, status request: ${isStatusRequest}`);
  
  // Check if this is a status request
  if (isStatusRequest) {
    try {
      // Get the latest execution log
      const latestLog = await getLatestExecutionLog();
      
      // Calculate next scheduled run
      const nextRun = getNextScheduledRunTime();
      
      // Prepare the status response
      const statusResponse = {
        success: true,
        lastRun: latestLog.success ? latestLog.data : null,
        nextScheduledRun: nextRun,
        scheduledInterval: 'Hourly',
      };
      
      return new Response(
        JSON.stringify(statusResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error in status endpoint:', error);
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
  }
  
  try {
    // Get the date range for the current week
    const startDate = getMondayOfCurrentWeek();
    const endDate = getCurrentDate();
    
    // Format dates for API calls
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    
    console.log(`Starting automated import for current week (${formattedStartDate} to ${formattedEndDate})`);
    
    // Check if start date is after end date (should never happen, but just in case)
    if (isAfter(startDate, endDate)) {
      throw new Error('Invalid date range: start date is after end date');
    }
    
    // Use the progressive loading function to fetch and import orders
    const result = await progressivelyLoadOrders(formattedStartDate, formattedEndDate);
    
    // Prepare the final response
    const finalResult = { 
      success: result.success, 
      dateRange: {
        start: formattedStartDate,
        end: formattedEndDate
      },
      fetched: result.totalFetched,
      imported: result.totalImported,
      duplicates: result.totalDuplicates,
      errors: result.totalErrors,
      batchesProcessed: result.batchesProcessed,
      errorDetails: result.errorDetails,
      timestamp: new Date().toISOString()
    };
    
    // Log the execution result
    await logExecution(finalResult);
    
    // Return the response
    return new Response(
      JSON.stringify(finalResult),
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
