
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Supabase client with service role (for DB insert permission)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Type definition for our reports table
interface ReportEntry {
  id?: number;             // Auto-generated by Supabase
  org_id: string;         // Organization ID (string type)
  order_no: string | null;
  status: string;         // Status in our system
  optimoroute_status: string | null; // Status from OptimoRoute
  scheduled_time: string | null;
  end_time: string | null;
  cust_name: string | null;
  cust_group: string | null;
  tech_name: string | null;
  region: string | null;
  fetched_at: string;     // When we fetched this data
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Parse the request body to get the date parameter if provided
    const requestData = await req.json().catch(() => ({}));
    
    // Get date from request or use today's date as default
    const requestDate = requestData.date || new Date().toISOString().slice(0, 10);
    console.log(`Fetching reports for date: ${requestDate}`);
    
    const apiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
    
    // Default organization ID - in a real implementation, you might
    // fetch different data for different organizations
    const orgId = Deno.env.get('DEFAULT_ORG_ID') || 'default';
    
    const now = new Date().toISOString();  // Current timestamp for fetched_at
    
    // Construct API URL with the requested date
    const routesUrl = `https://api.optimoroute.com/v1/get_routes?key=${apiKey}&date=${requestDate}`;
    
    const response = await fetch(routesUrl);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('API reported unsuccessful operation');
    }
    
    // 2. Transform API data into our reports table structure
    const reportsPayload: ReportEntry[] = [];
    
    // First, collect all order numbers to query work_orders table in batch
    const orderNumbers: string[] = [];
    
    for (const route of data.routes || []) {
      for (const stop of route.stops) {
        if (!stop.id || stop.orderNo === "-") continue; // Skip non-order stops
        
        // Only add valid order numbers
        const orderNo = stop.orderNo !== "-" ? stop.orderNo : null;
        if (orderNo) orderNumbers.push(orderNo);
      }
    }

    // Helper function to fetch completion details
    async function getCompletionDetails(orderNumbers: string[], apiKey: string): Promise<any> {
      if (orderNumbers.length === 0) return { orders: [], success: true };
      
      const completionUrl = `https://api.optimoroute.com/v1/get_completion_details?key=${apiKey}`;
      const orders = orderNumbers.map(orderNo => ({ orderNo }));

      try {
        console.log(`Fetching completion details for ${orders.length} orders`);
        
        const response = await fetch(completionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orders })
        });

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          console.error('API reported unsuccessful operation:', data);
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching completion details:", error);
        return { orders: [], success: false, error: error.message };
      }
    }

    // Fetch completion details for all order numbers in batches (max 500 per API call)
    const completionDetailsMap = new Map();
    
    // Process in batches of 500
    const BATCH_SIZE = 500;
    for (let i = 0; i < orderNumbers.length; i += BATCH_SIZE) {
      const batch = orderNumbers.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i/BATCH_SIZE + 1}, size: ${batch.length}`);
      
      const completionDetails = await getCompletionDetails(batch, apiKey);
      
      if (completionDetails && completionDetails.orders) {
        for (const order of completionDetails.orders) {
          if (order.success && order.data) {
            completionDetailsMap.set(order.orderNo || order.id, order.data);
          }
        }
      }
      
      // Add a small delay between batches to avoid rate limiting
      if (orderNumbers.length > BATCH_SIZE && i + BATCH_SIZE < orderNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Now process routes and stops with status information
    const processedOrderNos = new Set(); // Track already processed order numbers
    
    for (const route of data.routes || []) {
      const driverId = route.driverSerial || null;
      const techName = route.driverName || null;
      const region = null; // Could be determined from route data if available
      
      for (const stop of route.stops) {
        // Skip non-order stops like start/end points
        if (!stop.id || stop.orderNo === "-") continue;
        
        const orderNo = stop.orderNo !== "-" ? stop.orderNo : null;
        if (!orderNo) continue;
        
        // Skip if we've already processed this order number
        if (processedOrderNos.has(orderNo)) continue;
        processedOrderNos.add(orderNo);
        
        const custName = stop.locationName || null;
        
        // Extract customer group from customer name
        // Examples: "Dollar General #1234" -> "Dollar General"
        //           "Menards #5678" -> "Menards"
        let custGroup = null;
        if (custName && custName.includes('#')) {
          // Split at the '#' and take the first part, trimming any whitespace
          custGroup = custName.split('#')[0].trim();
        }
        
        // Get status and end_time from completion details if available, otherwise use defaults
        const completionDetail = completionDetailsMap.get(orderNo);
        const status = completionDetail ? completionDetail.status : "Scheduled";
        const endTime = completionDetail && completionDetail.endTime ? completionDetail.endTime.utcTime : null;
        
        reportsPayload.push({
          org_id: orgId,
          order_no: orderNo,
          status: status, // Status from completion details
          optimoroute_status: "Planned", // Default status from OptimoRoute for planned stops
          scheduled_time: stop.scheduledAtDt || null,
          end_time: endTime, 
          cust_name: custName,
          cust_group: custGroup,
          tech_name: techName,
          region: region,
          fetched_at: now
        });
      }
    }
    
    // 3. Upsert into the reports table
    if (reportsPayload.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: `No reports found for date: ${requestDate}`
      }), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Remove existing records for this date before inserting new ones
    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('fetched_at', now);
      
    if (deleteError) {
      console.error("Delete error:", deleteError);
      // Continue with insert even if delete fails
    }
    
    // Insert records in batches to avoid potential conflicts
    const UPSERT_BATCH_SIZE = 100;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < reportsPayload.length; i += UPSERT_BATCH_SIZE) {
      const batch = reportsPayload.slice(i, i + UPSERT_BATCH_SIZE);
      const { error, count } = await supabase
        .from('reports')
        .insert(batch)
        .select('count');
        
      if (error) {
        console.error(`Batch insert error for batch ${i/UPSERT_BATCH_SIZE + 1}:`, error);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
      }
    }
    
    if (errorCount > 0) {
      return new Response(JSON.stringify({
        success: successCount > 0,
        count: successCount,
        message: `Successfully inserted ${successCount} reports, but failed to insert ${errorCount} reports for date: ${requestDate}`
      }), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      count: successCount,
      message: `Successfully updated ${successCount} reports for date: ${requestDate}`
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error("Error fetching or processing OptimoRoute data:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});
