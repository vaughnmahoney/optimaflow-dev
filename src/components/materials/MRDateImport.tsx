
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
      
      toast.success(`Successfully imported ${data.driverCount} drivers with ${data.orderCount} orders`);
    } catch (err) {
      console.error('Error importing route data:', err);
      setError(err.message || 'Failed to import route data');
      toast.error('Failed to import route data: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
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
