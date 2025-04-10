
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
import { OrdersSearchTable } from './OrdersSearchTable';

export const UnscheduledOrdersControl = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchStats, setSearchStats] = useState<{
    totalOrders: number;
    dateRange: { startDate: string; endDate: string };
  } | null>(null);

  const handleFetch = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select both start and end dates");
      return;
    }
    
    setIsLoading(true);
    setOrders([]);
    setSearchStats(null);
    
    try {
      const formattedStartDate = format(dateRange.from, 'yyyy-MM-dd');
      const formattedEndDate = format(dateRange.to, 'yyyy-MM-dd');
      
      console.log(`Fetching orders for date range: ${formattedStartDate} to ${formattedEndDate}`);
      
      const { data, error } = await supabase.functions.invoke('get-unscheduled-orders', {
        body: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });
      
      if (error) {
        console.error('Error fetching orders:', error);
        
        let errorMessage = 'Failed to fetch orders';
        if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        toast.error(errorMessage);
        return;
      }
      
      console.log('Orders response:', data);
      
      if (!data || !data.success) {
        const errorMessage = data?.error || 'Invalid response from server';
        console.error('API error:', errorMessage);
        toast.error(`Error: ${errorMessage}`);
        return;
      }
      
      // Set the orders and search stats
      setOrders(data.data.orders || []);
      setSearchStats({
        totalOrders: data.data.totalOrders,
        dateRange: data.data.dateRange
      });
      
      toast.success(`Found ${data.data.totalOrders} orders`);
      
    } catch (error) {
      console.error('Exception fetching orders:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to fetch orders: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Orders Search Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
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
                Searching...
              </>
            ) : (
              'Search Orders'
            )}
          </Button>
        </div>
        
        {searchStats && (
          <div className="bg-slate-50 p-3 rounded-md mb-4 text-sm">
            <p>
              Found <span className="font-semibold">{searchStats.totalOrders}</span> orders 
              from <span className="font-semibold">{searchStats.dateRange.startDate}</span> 
              to <span className="font-semibold">{searchStats.dateRange.endDate}</span>
            </p>
          </div>
        )}
        
        <OrdersSearchTable orders={orders} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};
