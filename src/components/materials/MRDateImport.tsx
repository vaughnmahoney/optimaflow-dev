
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMRStore } from '@/store/useMRStore';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const MRDateImport = () => {
  const { importDate, setImportDate, isLoading, setIsLoading, setDrivers, setError } = useMRStore();

  const handleImport = async () => {
    if (!importDate) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Format date as YYYY-MM-DD for the API
      const formattedDate = format(importDate, 'yyyy-MM-dd');
      
      console.log(`Calling get-optimoroute-routes with date: ${formattedDate}`);
      
      // Call the updated edge function to fetch route data
      const { data, error } = await supabase.functions.invoke('get-optimoroute-routes', {
        body: { date: formattedDate }
      });
      
      console.log('Edge function response:', data, error);
      
      if (error) throw new Error(error.message);
      if (!data || !data.success) throw new Error(data?.error || 'Failed to retrieve data from OptimoRoute');
      if (!data.drivers || data.drivers.length === 0) throw new Error('No drivers or routes found for this date');
      
      // Use the drivers data directly from the response
      setDrivers(data.drivers);
      
      // If we have order IDs and notes aren't already included, fetch order details in batches
      if (data.orderIds && data.orderIds.length > 0 && !data.notesIncluded) {
        toast.info(`Fetching additional order details for ${data.orderIds.length} orders...`);
        await fetchOrderDetailsInBatches(data.orderIds, data.drivers);
      }
      
      toast.success(`Successfully imported ${data.driverCount} drivers with ${data.orderCount} orders`);
    } catch (err) {
      console.error('Error importing route data:', err);
      setError(err.message || 'Failed to import route data');
      toast.error('Failed to import route data: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch order details in batches of 500 (API limit)
  const fetchOrderDetailsInBatches = async (orderIds: string[], driversData: any[]) => {
    if (!orderIds.length) return;
    
    try {
      // Create batches of max 500 orders (API limit)
      const batchSize = 500;
      const batches = [];
      
      for (let i = 0; i < orderIds.length; i += batchSize) {
        batches.push(orderIds.slice(i, i + batchSize));
      }
      
      console.log(`Split ${orderIds.length} orders into ${batches.length} batches for processing`);
      
      // Process all batches in parallel
      const batchResults = await Promise.all(
        batches.map(async (batchOrderIds, index) => {
          console.log(`Processing batch ${index + 1}/${batches.length} with ${batchOrderIds.length} orders`);
          
          try {
            const { data, error } = await supabase.functions.invoke('search-optimoroute', {
              body: { orderNumbers: batchOrderIds }
            });
            
            if (error) throw new Error(`Batch ${index + 1} error: ${error.message}`);
            if (!data.success) throw new Error(`Batch ${index + 1} failed: ${data.error || 'Unknown error'}`);
            
            return data.orders || [];
          } catch (err) {
            console.error(`Error processing batch ${index + 1}:`, err);
            // Return empty array for failed batch instead of failing completely
            return [];
          }
        })
      );
      
      // Flatten results from all batches
      const allOrders = batchResults.flat();
      console.log(`Retrieved ${allOrders.length} order details from ${batches.length} batches`);
      
      // Create a map for quick orderNo lookup
      const orderDetailsMap = new Map();
      allOrders.forEach(order => {
        if (order.data && order.data.orderNo) {
          orderDetailsMap.set(order.data.orderNo, order);
        }
      });
      
      // Update drivers with notes from order details
      const updatedDrivers = driversData.map(driver => {
        // Update each work order with notes if available
        const updatedWorkOrders = driver.workOrders.map(workOrder => {
          const orderDetails = orderDetailsMap.get(workOrder.orderId);
          if (orderDetails && orderDetails.data) {
            return {
              ...workOrder,
              notes: orderDetails.data.notes || '',
              searchResponse: orderDetails
            };
          }
          return workOrder;
        });
        
        return {
          ...driver,
          workOrders: updatedWorkOrders
        };
      });
      
      // Update the store with enhanced data
      setDrivers(updatedDrivers);
      console.log('Updated drivers with order notes data', updatedDrivers);
      
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast.error('Error fetching additional order details. Some information may be incomplete.');
      // Don't throw here - we want to continue with at least the basic data
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Route</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !importDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {importDate ? format(importDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={importDate || undefined}
                  onSelect={(date) => setImportDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button 
            disabled={!importDate || isLoading} 
            onClick={handleImport}
          >
            {isLoading ? 'Importing...' : 'Import Route'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
