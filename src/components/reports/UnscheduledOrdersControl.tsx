
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from 'react-day-picker';
import { CalendarIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const UnscheduledOrdersControl = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFetch = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select both start and end dates");
      return;
    }
    
    setIsLoading(true);
    setResults(null);
    
    try {
      const formattedStartDate = format(dateRange.from, 'yyyy-MM-dd');
      const formattedEndDate = format(dateRange.to, 'yyyy-MM-dd');
      
      const { data, error } = await supabase.functions.invoke('get-unscheduled-orders', {
        body: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });
      
      if (error) {
        console.error('Error fetching unscheduled orders:', error);
        toast.error(`Error: ${error.message}`);
        setResults({
          success: false,
          message: error.message
        });
        return;
      }
      
      console.log('Unscheduled orders response:', data);
      
      setResults({
        success: true,
        totalOrders: data.totalOrders,
        unscheduledOrders: data.unscheduledOrders,
        insertedCount: data.insertResult?.count || 0,
        message: `Found ${data.unscheduledOrders} unscheduled orders out of ${data.totalOrders} total orders.`
      });
      
      toast.success(`Found ${data.unscheduledOrders} unscheduled orders`);
      
    } catch (error) {
      console.error('Exception fetching unscheduled orders:', error);
      setResults({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      toast.error('Failed to fetch unscheduled orders');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Unscheduled Orders Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="grid gap-2 flex-1">
            <label className="text-sm font-medium">Select Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'PPP')} - {format(dateRange.to, 'PPP')}
                      </>
                    ) : (
                      format(dateRange.from, 'PPP')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            onClick={handleFetch} 
            disabled={isLoading || !dateRange?.from || !dateRange?.to}
            className="mt-2 md:mt-0 md:self-end"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Fetch Unscheduled Orders'
            )}
          </Button>
        </div>
        
        {results && (
          <div className={`mt-4 text-sm p-3 rounded-md ${results.success ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            <p className="font-medium">{results.message}</p>
            {results.success && (
              <>
                <p className="mt-1">Found {results.unscheduledOrders} unscheduled orders out of {results.totalOrders} total orders</p>
                <p className="mt-1">Saved {results.insertedCount} orders to test table with status "unscheduled"</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
