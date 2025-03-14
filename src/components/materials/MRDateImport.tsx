
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
      
      // Call the correct edge function to fetch route data
      const { data, error } = await supabase.functions.invoke('get-optimoroute-routes', {
        body: { date: formattedDate }
      });
      
      console.log('Edge function response:', data, error);
      
      if (error) throw new Error(error.message);
      if (!data || !data.orders) throw new Error('No data returned from API');
      
      // Process the response to extract drivers and their work orders
      const processedDrivers = processOptimoRouteData(data.orders, formattedDate);
      setDrivers(processedDrivers);
      
      toast.success(`Successfully imported ${processedDrivers.length} drivers`);
    } catch (err) {
      console.error('Error importing route data:', err);
      setError(err.message || 'Failed to import route data');
      toast.error('Failed to import route data');
    } finally {
      setIsLoading(false);
    }
  };

  // Process the OptimoRoute response into our Driver/WorkOrder structure
  const processOptimoRouteData = (orders, formattedDate) => {
    const driversMap = new Map();
    
    // Group orders by driver
    orders.forEach(order => {
      if (!order.driverName) return; // Skip orders without a driver
      
      const driverId = order.driverId?.toString() || order.driverName;
      
      if (!driversMap.has(driverId)) {
        driversMap.set(driverId, {
          id: driverId,
          name: order.driverName,
          workOrders: []
        });
      }
      
      // Extract materials from order
      const materials = [];
      
      // Extract filters if present
      if (order.customFields?.filters) {
        try {
          const filterData = JSON.parse(order.customFields.filters);
          if (Array.isArray(filterData)) {
            filterData.forEach(filter => {
              materials.push({
                id: `filter-${order.id}-${materials.length}`,
                name: filter.name || 'Air Filter',
                type: 'filter',
                size: filter.size || 'Standard',
                quantity: filter.quantity || 1,
                unit: 'piece'
              });
            });
          }
        } catch (e) {
          console.warn('Error parsing filter data:', e);
        }
      }
      
      // Extract coils if present
      if (order.customFields?.coils) {
        try {
          const coilData = JSON.parse(order.customFields.coils);
          if (Array.isArray(coilData)) {
            coilData.forEach(coil => {
              materials.push({
                id: `coil-${order.id}-${materials.length}`,
                name: coil.name || 'HVAC Coil',
                type: 'coil',
                size: coil.size,
                quantity: coil.quantity || 1,
                unit: 'piece'
              });
            });
          }
        } catch (e) {
          console.warn('Error parsing coil data:', e);
        }
      }
      
      // If no materials were found but we know this is a service job,
      // add default materials based on service type
      if (materials.length === 0 && order.type) {
        if (order.type.toLowerCase().includes('filter')) {
          materials.push({
            id: `filter-${order.id}-default`,
            name: 'Standard Air Filter',
            type: 'filter',
            quantity: 1,
            unit: 'piece'
          });
        }
        
        if (order.type.toLowerCase().includes('coil')) {
          materials.push({
            id: `coil-${order.id}-default`,
            name: 'Standard HVAC Coil',
            type: 'coil',
            quantity: 1,
            unit: 'piece'
          });
        }
      }
      
      // Create work order object
      const workOrder = {
        id: order.id.toString(),
        orderId: order.orderNumber || order.id.toString(),
        locationName: order.location?.name || 'Unknown Location',
        address: order.location?.address || 'No Address',
        date: order.date || formattedDate,
        materials
      };
      
      // Add to driver's work orders
      driversMap.get(driverId).workOrders.push(workOrder);
    });
    
    // Convert map to array
    return Array.from(driversMap.values());
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
