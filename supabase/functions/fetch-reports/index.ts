import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface ReportEntry {
  id?: number;             // Auto-generated by Supabase
  org_id: string;         // Organization ID (string type)
  order_no: string | null;
  status: string;         // Status in our system
  optimoroute_status: string | null; // Status from OptimoRoute
  scheduled_time: string | null;
  start_time: string | null; // Added: When the job was started
  end_time: string | null;   // When the job was completed
  job_duration: string | null; // Added: Duration of the job
  notes: string | null;     // Added: Notes from completion details
  address: string | null;   // Added: Location address
  latitude: number | null;  // Added: Location latitude
  longitude: number | null; // Added: Location longitude
  cust_name: string | null;
  cust_group: string | null;
  tech_name: string | null;
  region: string | null;
  fetched_at: string;     // When we fetched this data
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const requestData = await req.json().catch(() => ({}));
    const requestDate = requestData.date || new Date().toISOString().slice(0, 10);
    console.log(`Fetching reports for date: ${requestDate}`);
    
    const apiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
    const orgId = Deno.env.get('DEFAULT_ORG_ID') || 'default';
    const now = new Date().toISOString();
    
    let allRoutes = [];
    let afterTag = null;
    let hasMorePages = true;
    let pageCount = 0;
    
    while (hasMorePages) {
      pageCount++;
      console.log(`Fetching routes page ${pageCount}${afterTag ? ' with afterTag' : ''}`);
      
      let routesUrl = `https://api.optimoroute.com/v1/get_routes?key=${apiKey}&date=${requestDate}`;
      if (afterTag) {
        routesUrl += `&afterTag=${afterTag}`;
      }
      
      const response = await fetch(routesUrl);
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('API reported unsuccessful operation');
      }
      
      if (data.routes && data.routes.length > 0) {
        allRoutes.push(...data.routes);
        console.log(`Received ${data.routes.length} routes in page ${pageCount}, total so far: ${allRoutes.length}`);
      } else {
        console.log(`No routes found in page ${pageCount}`);
      }
      
      if (data.afterTag) {
        afterTag = data.afterTag;
        console.log(`More pages available, next afterTag: ${afterTag}`);
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        hasMorePages = false;
        console.log(`No more pages, finished after ${pageCount} page(s)`);
      }
    }
    
    console.log(`Finished fetching all ${allRoutes.length} routes across ${pageCount} page(s)`);
    
    const orderNumbers: string[] = [];
    
    for (const route of allRoutes || []) {
      for (const stop of route.stops) {
        if (!stop.id || stop.orderNo === "-") continue;
        
        const orderNo = stop.orderNo !== "-" ? stop.orderNo : null;
        if (orderNo) orderNumbers.push(orderNo);
      }
    }
    
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
    
    const completionDetailsMap = new Map();
    
    const BATCH_SIZE = 500;
    for (let i = 0; i < orderNumbers.length; i += BATCH_SIZE) {
      const batch = orderNumbers.slice(i, i + BATCH_SIZE);
<<<<<<< HEAD
      // Process batch
=======
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
      
      const completionDetails = await getCompletionDetails(batch, apiKey);
      
      if (completionDetails && completionDetails.orders) {
        console.log(`Received ${completionDetails.orders.length} orders in completion details`);
        
<<<<<<< HEAD
        for (const order of completionDetails.orders) {
          if (order.success && order.data) {
            // Store the entire order object, not just the data property
            completionDetailsMap.set(order.orderNo || order.id, order);
=======
        if (completionDetails.orders.length > 0) {
          const sampleOrder = completionDetails.orders[0];
          console.log(`Sample order structure:`, JSON.stringify(sampleOrder, null, 2));
          console.log(`Sample order has startTime:`, !!sampleOrder.data?.startTime);
          
          if (sampleOrder.data?.form?.note) {
            console.log(`Sample order has notes:`, sampleOrder.data.form.note.substring(0, 100));
          } else {
            console.log(`Sample order notes paths:`, {
              hasForm: !!sampleOrder.data?.form,
              hasDirectNote: !!sampleOrder.data?.note,
              hasOrders: !!sampleOrder.orders && Array.isArray(sampleOrder.orders),
              ordersLength: sampleOrder.orders?.length || 0
            });
          }
        }
        
        for (const order of completionDetails.orders) {
          if (order.success && order.data) {
            console.log(`Storing data for order ${order.orderNo || order.id}, has startTime:`, !!order.data.startTime);
            completionDetailsMap.set(order.orderNo || order.id, order.data);
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
          }
        }
      }
      
      if (orderNumbers.length > BATCH_SIZE && i + BATCH_SIZE < orderNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const workOrderStatusMap = new Map();
    const STATUS_BATCH_SIZE = 50;
    for (let i = 0; i < orderNumbers.length; i += STATUS_BATCH_SIZE) {
      const batch = orderNumbers.slice(i, i + STATUS_BATCH_SIZE);
<<<<<<< HEAD
      // Process batch
=======
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
      
      try {
        const { data: batchWorkOrders, error: batchError } = await supabase
          .from('work_orders')
          .select('order_no, status')
          .in('order_no', batch);
          
        if (batchError) {
          console.error(`Error fetching batch work orders status (batch ${Math.floor(i/STATUS_BATCH_SIZE) + 1}):`, batchError);
          continue;
        }
        
        if (batchWorkOrders && batchWorkOrders.length > 0) {
<<<<<<< HEAD
          // Process batch
=======
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
          batchWorkOrders.forEach(order => {
            if (order.order_no && order.status) {
              workOrderStatusMap.set(order.order_no, order.status);
            }
          });
        }
        
        if (i + STATUS_BATCH_SIZE < orderNumbers.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error(`Exception when processing status batch ${Math.floor(i/STATUS_BATCH_SIZE) + 1}:`, error);
      }
    }
    
    console.log(`Work order status map has ${workOrderStatusMap.size} entries after all batches`);
    
<<<<<<< HEAD
    // Work order status map is ready
=======
    let sampleCount = 0;
    for (const [key, value] of workOrderStatusMap.entries()) {
      console.log(`Sample status mapping: order_no "${key}" -> status "${value}"`);
      if (++sampleCount >= 5) break;
    }
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
    
    if (workOrderStatusMap.size === 0) {
      console.log('No existing work orders found with matching order numbers after all batches');
    }
    
    const processedOrderNos = new Set();
    const reportsPayload: ReportEntry[] = [];
    
    for (const route of allRoutes || []) {
      const driverId = route.driverSerial || null;
      const techName = route.driverName || null;
      const region = null;
      
      for (const stop of route.stops) {
        if (!stop.id || stop.orderNo === "-") continue;
        
        const orderNo = stop.orderNo !== "-" ? stop.orderNo : null;
        if (!orderNo) continue;
        
        if (processedOrderNos.has(orderNo)) continue;
        processedOrderNos.add(orderNo);
        
        const custName = stop.locationName || null;
        
        let custGroup = null;
        if (custName && custName.includes('#')) {
          custGroup = custName.split('#')[0].trim();
        }
        
        const completionDetail = completionDetailsMap.get(orderNo);
        const optimorouteStatus = completionDetail && completionDetail.data ? completionDetail.data.status : "Planned";
        
        let endTime = null;
        let startTime = null;
        let jobDuration = null;
        let notes = null;
        
        if (completionDetail) {
<<<<<<< HEAD
          // Extract end time
          if (completionDetail.data && completionDetail.data.endTime) {
            // First try to use localTime which should be in the driver's timezone
=======
          if (completionDetail.endTime) {
            if (completionDetail.endTime.localTime) {
              endTime = completionDetail.endTime.localTime;
              console.log(`Direct endTime for ${orderNo}: ${endTime}`);
            } else if (completionDetail.endTime.utcTime) {
              endTime = completionDetail.endTime.utcTime;
              console.log(`Direct UTC endTime for ${orderNo}: ${endTime}`);
            }
          }
          else if (completionDetail.data && completionDetail.data.endTime) {
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
            if (completionDetail.data.endTime.localTime) {
              endTime = completionDetail.data.endTime.localTime;
<<<<<<< HEAD
              // No logging needed now that everything is working
            } 
            // Fall back to UTC time if local time is not available
            else if (completionDetail.data.endTime.utcTime) {
              endTime = completionDetail.data.endTime.utcTime;
              // No logging needed now that everything is working
            }
          }
          
          // No detailed debug logging needed now that everything is working
          
          // Try multiple paths to extract start time
          // First check if we can get it from the data property
          if (completionDetail.data && completionDetail.data.startTime) {
            // First try to use localTime which should be in the driver's timezone
            if (completionDetail.data.startTime.localTime) {
              startTime = completionDetail.data.startTime.localTime;
            } 
            // Fall back to UTC time if local time is not available
            else if (completionDetail.data.startTime.utcTime) {
              startTime = completionDetail.data.startTime.utcTime;
            }
          }
          
          // If we couldn't find startTime in the data property, try the orders array
          if (!startTime && completionDetail.orders && Array.isArray(completionDetail.orders) && completionDetail.orders.length > 0) {
            const firstOrder = completionDetail.orders[0];
            if (firstOrder.data && firstOrder.data.startTime) {
              if (firstOrder.data.startTime.localTime) {
                startTime = firstOrder.data.startTime.localTime;
              } else if (firstOrder.data.startTime.utcTime) {
                startTime = firstOrder.data.startTime.utcTime;
=======
              console.log(`Using data.endTime.localTime for ${orderNo}: ${endTime}`);
            } else if (completionDetail.data.endTime.utcTime) {
              endTime = completionDetail.data.endTime.utcTime;
              console.log(`Using data.endTime.utcTime for ${orderNo}: ${endTime}`);
            }
          }
          
          if (orderNo.endsWith('1') || orderNo.endsWith('2') || orderNo.endsWith('3')) {
            console.log(`=== DETAILED DEBUG FOR ORDER ${orderNo} ===`);
            console.log(`completionDetail full structure:`, JSON.stringify(completionDetail, null, 2));
            console.log(`completionDetail has startTime:`, !!completionDetail.startTime);
            console.log(`completionDetail has data:`, !!completionDetail.data);
            if (completionDetail.data) {
              console.log(`completionDetail.data has startTime:`, !!completionDetail.data.startTime);
            }
            
            console.log(`Notes paths:`, {
              hasFormDirect: !!completionDetail.form,
              hasNote: !!completionDetail.note,
              directNotePath: completionDetail.note ? 'completionDetail.note' : 'N/A',
              hasDataForm: !!completionDetail.data?.form,
              dataFormNotePath: completionDetail.data?.form?.note ? 'completionDetail.data.form.note' : 'N/A'
            });
          }
          
          if (completionDetail.startTime) {
            if (completionDetail.startTime.localTime) {
              startTime = completionDetail.startTime.localTime;
              console.log(`Direct startTime for ${orderNo}: ${startTime}`);
            } else if (completionDetail.startTime.utcTime) {
              startTime = completionDetail.startTime.utcTime;
              console.log(`Direct UTC startTime for ${orderNo}: ${startTime}`);
            }
          }
          else if (completionDetail.data && completionDetail.data.startTime) {
            if (completionDetail.data.startTime.localTime) {
              startTime = completionDetail.data.startTime.localTime;
              console.log(`Using data.startTime.localTime for ${orderNo}: ${startTime}`);
            } else if (completionDetail.data.startTime.utcTime) {
              startTime = completionDetail.data.startTime.utcTime;
              console.log(`Using data.startTime.utcTime for ${orderNo}: ${startTime}`);
            }
          }
          
          if (!startTime) {
            if (completionDetail.orders && Array.isArray(completionDetail.orders) && completionDetail.orders.length > 0) {
              const firstOrder = completionDetail.orders[0];
              if (firstOrder.data && firstOrder.data.startTime) {
                if (firstOrder.data.startTime.localTime) {
                  startTime = firstOrder.data.startTime.localTime;
                  console.log(`Found startTime in orders array for ${orderNo}: ${startTime}`);
                } else if (firstOrder.data.startTime.utcTime) {
                  startTime = firstOrder.data.startTime.utcTime;
                  console.log(`Found startTime (UTC) in orders array for ${orderNo}: ${startTime}`);
                }
              }
            }
            
            if (!startTime && completionDetail.data && completionDetail.data.form && completionDetail.data.form.startTime) {
              const formStartTime = completionDetail.data.form.startTime;
              if (typeof formStartTime === 'string') {
                startTime = formStartTime;
                console.log(`Found startTime in form data as string for ${orderNo}: ${startTime}`);
              } else if (formStartTime.localTime) {
                startTime = formStartTime.localTime;
                console.log(`Found startTime in form data for ${orderNo}: ${startTime}`);
              } else if (formStartTime.utcTime) {
                startTime = formStartTime.utcTime;
                console.log(`Found startTime (UTC) in form data for ${orderNo}: ${startTime}`);
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
              }
            }
          }
          
          if (startTime && endTime) {
            try {
              const startDate = new Date(startTime);
              const endDate = new Date(endTime);
<<<<<<< HEAD
              const durationMs = endDate.getTime() - startDate.getTime();
              // Format as ISO duration string (PT1H30M format)
              const hours = Math.floor(durationMs / (1000 * 60 * 60));
              const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
              jobDuration = `PT${hours}H${minutes}M`;
              // Job duration calculated successfully
=======
              if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                const durationMs = endDate.getTime() - startDate.getTime();
                jobDuration = `PT${Math.floor(durationMs / (1000 * 60 * 60))}H${Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))}M`;
                console.log(`Calculated job duration for ${orderNo}: ${jobDuration}`);
              } else {
                console.log(`Invalid date format for ${orderNo}: startTime=${startTime}, endTime=${endTime}`);
              }
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
            } catch (error) {
              console.error(`Error calculating job duration for ${orderNo}:`, error);
            }
          }
          
          if (completionDetail.data?.form?.note) {
            notes = completionDetail.data.form.note;
<<<<<<< HEAD
            // Notes extracted successfully
=======
            console.log(`Extracted notes from data.form.note for ${orderNo}: ${notes.substring(0, 50)}${notes.length > 50 ? '...' : ''}`);
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
          }
          else if (completionDetail.form?.note) {
            notes = completionDetail.form.note;
            console.log(`Extracted notes from direct form.note for ${orderNo}: ${notes.substring(0, 50)}${notes.length > 50 ? '...' : ''}`);
          }
          else if (completionDetail.note) {
            notes = completionDetail.note;
            console.log(`Extracted notes from direct note property for ${orderNo}: ${notes.substring(0, 50)}${notes.length > 50 ? '...' : ''}`);
          }
          else if (completionDetail.orders && Array.isArray(completionDetail.orders) && completionDetail.orders.length > 0) {
            const firstOrder = completionDetail.orders[0];
            if (firstOrder.data?.form?.note) {
              notes = firstOrder.data.form.note;
              console.log(`Extracted notes from orders array for ${orderNo}: ${notes.substring(0, 50)}${notes.length > 50 ? '...' : ''}`);
            }
          }
          
          if (!notes && (orderNo.endsWith('1') || orderNo.endsWith('2') || orderNo.endsWith('3'))) {
            console.log(`No notes found for ${orderNo} after trying all paths`);
          }
          
          const workOrderStatus = workOrderStatusMap.get(orderNo) || "Scheduled";
          
          let address = stop.address || null;
          let latitude = stop.latitude || null;
          let longitude = stop.longitude || null;
          
          if (orderNo.endsWith('1') || orderNo.endsWith('2') || orderNo.endsWith('3')) {
            console.log(`=== LOCATION DEBUG FOR ORDER ${orderNo} ===`);
            console.log(`stop has address:`, !!stop.address);
            console.log(`stop has latitude:`, !!stop.latitude);
            console.log(`stop has longitude:`, !!stop.longitude);
            console.log(`Extracted address: ${address}`);
            console.log(`Extracted latitude: ${latitude}`);
            console.log(`Extracted longitude: ${longitude}`);
          }
          
          reportsPayload.push({
            org_id: orgId,
            order_no: orderNo,
            status: workOrderStatus,
            optimoroute_status: optimorouteStatus,
            scheduled_time: stop.scheduledAtDt || null,
            start_time: startTime,
            end_time: endTime,
            job_duration: jobDuration,
            notes: notes,
            address: address,
            latitude: latitude,
            longitude: longitude,
            cust_name: custName,
            cust_group: custGroup || custName,
            tech_name: techName,
            region: region,
            fetched_at: now
          });
        }
<<<<<<< HEAD
        
        // Use existing work order status if available, otherwise default to "Scheduled"
        const workOrderStatus = workOrderStatusMap.get(orderNo) || "Scheduled";
        
        // CRITICAL DEBUG: Log the actual stop object structure to understand available properties
        if (orderNo.endsWith('1')) { // Only log for a few orders to reduce noise
          console.log(`LOCATION DEBUG - Stop object for ${orderNo}:`, JSON.stringify(stop, null, 2));
          console.log(`LOCATION DEBUG - Stop address exists:`, !!stop.address);
          console.log(`LOCATION DEBUG - Stop latitude type:`, typeof stop.latitude);
          console.log(`LOCATION DEBUG - Stop longitude type:`, typeof stop.longitude);
          
          // Check if location is a nested property
          console.log(`LOCATION DEBUG - Stop has location property:`, !!stop.location);
          if (stop.location) {
            console.log(`LOCATION DEBUG - Stop location structure:`, JSON.stringify(stop.location, null, 2));
          }
        }
        
        // Extract location data using multiple paths
        let address = null;
        let latitude = null;
        let longitude = null;
        
        // First try to get location data directly from the stop object
        if (stop.address) {
          address = stop.address;
          if (orderNo.endsWith('1')) console.log(`LOCATION DEBUG - Found address directly on stop:`, address);
        }
        if (typeof stop.latitude === 'number') {
          latitude = stop.latitude;
          if (orderNo.endsWith('1')) console.log(`LOCATION DEBUG - Found latitude directly on stop:`, latitude);
        }
        if (typeof stop.longitude === 'number') {
          longitude = stop.longitude;
          if (orderNo.endsWith('1')) console.log(`LOCATION DEBUG - Found longitude directly on stop:`, longitude);
        }
        
        // If not found, check if it's in a nested location property
        if ((!address || !latitude || !longitude) && stop.location) {
          if (!address && stop.location.address) {
            address = stop.location.address;
            if (orderNo.endsWith('1')) console.log(`LOCATION DEBUG - Found address in location property:`, address);
          }
          if (!latitude && typeof stop.location.latitude === 'number') {
            latitude = stop.location.latitude;
            if (orderNo.endsWith('1')) console.log(`LOCATION DEBUG - Found latitude in location property:`, latitude);
          }
          if (!longitude && typeof stop.location.longitude === 'number') {
            longitude = stop.location.longitude;
            if (orderNo.endsWith('1')) console.log(`LOCATION DEBUG - Found longitude in location property:`, longitude);
          }
        }
        
        // CRITICAL DEBUG: Log what we're actually using for the database
        if (orderNo.endsWith('1')) {
          console.log(`LOCATION DEBUG - Final values for ${orderNo}:`);
          console.log(`  address: ${address || 'null'}`);
          console.log(`  latitude: ${latitude || 'null'}`);
          console.log(`  longitude: ${longitude || 'null'}`);
        }
        
        reportsPayload.push({
          org_id: orgId,
          order_no: orderNo,
          status: workOrderStatus, // Status from work_orders table with fallback to "Scheduled"
          optimoroute_status: optimorouteStatus, // Status from completion details
          scheduled_time: stop.scheduledAtDt || null,
          start_time: startTime,
          end_time: endTime,
          job_duration: jobDuration,
          notes: notes,
          address: address,
          latitude: latitude,
          longitude: longitude,
          cust_name: custName,
          cust_group: custGroup || custName, // Use custName as fallback when custGroup is null
          tech_name: techName,
          region: region,
          fetched_at: now
        });
=======
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
      }
    }
    
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
    
<<<<<<< HEAD
    // Prepare summary for debug output
=======
    console.log(`=== SUMMARY BEFORE UPSERT ===`);
    
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
    const reportsWithStartTime = reportsPayload.filter(r => r.start_time !== null).length;
    const reportsWithEndTime = reportsPayload.filter(r => r.end_time !== null).length;
    const reportsWithNotes = reportsPayload.filter(r => r.notes !== null).length;
    const reportsWithAddress = reportsPayload.filter(r => r.address !== null).length;
    
<<<<<<< HEAD
    // Changed: instead of deleting existing reports, we'll use upsert
    // This will insert new records and update existing ones
    
    // Insert/update reports in smaller batches to avoid hitting payload size limits
    const UPSERT_BATCH_SIZE = 50; // Reduce batch size to avoid issues
=======
    console.log(`CRITICAL DATA FIELDS:`);
    console.log(`START_TIME: ${reportsWithStartTime} / ${reportsPayload.length}`);
    console.log(`END_TIME: ${reportsWithEndTime} / ${reportsPayload.length}`);
    console.log(`NOTES: ${reportsWithNotes} / ${reportsPayload.length}`);
    console.log(`ADDRESS: ${reportsWithAddress} / ${reportsPayload.length}`);
    
    if (reportsPayload.length > 0) {
      const sampleNotes = reportsPayload.filter(r => r.notes !== null).slice(0, 3).map(r => 
        `${r.order_no}: ${r.notes!.substring(0, 50)}${r.notes!.length > 50 ? '...' : ''}`
      );
      console.log(`Sample notes (${sampleNotes.length}):`, sampleNotes);
      
      console.log(`Sample report payload:`, JSON.stringify(reportsPayload[0], null, 2));
    }
    
    const UPSERT_BATCH_SIZE = 50;
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < reportsPayload.length; i += UPSERT_BATCH_SIZE) {
      const batch = reportsPayload.slice(i, i + UPSERT_BATCH_SIZE);
<<<<<<< HEAD
      // Process batch
=======
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
      
      try {
        const { error } = await supabase
          .from('reports')
          .upsert(batch, { 
            onConflict: 'order_no',
            ignoreDuplicates: false
          });
          
        if (error) {
          console.error(`Batch upsert error for batch ${Math.floor(i/UPSERT_BATCH_SIZE) + 1}:`, error);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
<<<<<<< HEAD
          // Process batch
=======
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
        }
      } catch (error) {
        console.error(`Exception in batch ${Math.floor(i/UPSERT_BATCH_SIZE) + 1}:`, error);
        errorCount += batch.length;
      }
      
      if (i + UPSERT_BATCH_SIZE < reportsPayload.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    const isPartialSuccess = successCount > 0 && errorCount > 0;
    const isCompleteSuccess = successCount > 0 && errorCount === 0;
    const isCompleteFailure = successCount === 0 && errorCount > 0;
    
    if (isCompleteFailure) {
      return new Response(JSON.stringify({
        success: false,
        count: 0,
        message: `Failed to update all ${errorCount} reports for date: ${requestDate}`
      }), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    if (isPartialSuccess) {
      return new Response(JSON.stringify({
        success: true,
        count: successCount,
        message: `Successfully updated ${successCount} reports, with ${errorCount} failures for date: ${requestDate}`
      }), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
<<<<<<< HEAD
    // Collect comprehensive debug data (raw API responses)
    const debugData: any = {
      routes: [],
      stops: [],
      completionDetails: [],
      mappedOrders: []
    };
    
    // Collect sample route data (up to 2 routes)
    let routeCount = 0;
    for (const route of allRoutes || []) {
      if (routeCount < 2) {
        // Use type assertion to avoid TypeScript errors
        const routeData: any = route;
        debugData.routes.push({
          driverName: routeData.driverName || 'Unknown',
          driverSerial: routeData.driverSerial || 'N/A',
          stopCount: routeData.stops?.length || 0
        });
        routeCount++;
      }
      
      // Collect sample stops (up to 5 total)
      if (debugData.stops.length < 5) {
        // Use type assertion to avoid TypeScript errors
        const routeData: any = route;
        for (const stop of routeData.stops || []) {
          // Include both order and non-order stops for comparison
          const isOrderStop = stop.orderNo && stop.orderNo !== '-';
          debugData.stops.push({
            ...stop,
            isOrderStop: isOrderStop
          });
          
          if (debugData.stops.length >= 5) break;
        }
      }
    }
    
    // Collect sample completion details (up to 5)
    let detailCount = 0;
    for (const [orderNo, detail] of completionDetailsMap.entries()) {
      if (detailCount < 5) {
        debugData.completionDetails.push({
          orderNo: orderNo,
          data: detail
        });
        detailCount++;
      }
    }
    
    // Collect sample mapped orders (up to 5)
    debugData.mappedOrders = reportsPayload.slice(0, 5).map(r => ({
      order_no: r.order_no,
      address: r.address,
      latitude: r.latitude,
      longitude: r.longitude,
      start_time: r.start_time,
      end_time: r.end_time
    }));
    
    // Collect debug information
    const debugInfo = {
      summary: {
        total: reportsPayload.length,
        withStartTime: reportsWithStartTime,
        withEndTime: reportsWithEndTime,
        withNotes: reportsWithNotes,
        withAddress: reportsWithAddress
      },
      // Basic sample data for regular response
=======
    const debugInfo = {
      reportsWithStartTime: reportsPayload.filter(r => r.start_time !== null).length,
      reportsWithEndTime: reportsPayload.filter(r => r.end_time !== null).length,
      reportsWithAddress: reportsPayload.filter(r => r.address !== null).length,
      reportsWithNotes: reportsPayload.filter(r => r.notes !== null).length,
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
      sampleReports: reportsPayload.slice(0, 3).map(r => ({
        order_no: r.order_no,
        start_time: r.start_time,
        end_time: r.end_time,
        job_duration: r.job_duration,
        address: r.address,
<<<<<<< HEAD
        latitude: r.latitude,
        longitude: r.longitude,
=======
>>>>>>> 7a1385b8c62e7f68996cb6ee79b6240e71c1b337
        notes: r.notes ? r.notes.substring(0, 50) + (r.notes.length > 50 ? '...' : '') : null
      })),
      // Comprehensive debug data for troubleshooting
      rawApiData: debugData
    };
    
    return new Response(JSON.stringify({
      success: true,
      count: successCount,
      message: `Successfully updated ${successCount} reports for date: ${requestDate}`,
      debug: debugInfo
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
