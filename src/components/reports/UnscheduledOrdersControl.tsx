import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from 'react-day-picker';
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OrdersSearchTable } from './OrdersSearchTable';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OrdersSearchTableProps {
  orders: any[];
  isLoading?: boolean;
}

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
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select both start and end dates");
      return;
    }
    
    setIsLoading(true);
    setOrders([]);
    setSearchStats(null);
    setError(null);
    
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
        
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }
      
      console.log('Orders response:', data);
      
      if (!data || !data.success) {
        const errorMessage = data?.error || 'Invalid response from server';
        console.error('API error:', errorMessage);
        setError(`Error: ${errorMessage}`);
        toast.error(`Error: ${errorMessage}`);
        return;
      }
      
      setOrders(data.data.orders || []);
      setSearchStats({
        totalOrders: data.data.totalOrders,
        dateRange: data.data.dateRange
      });
      
      toast.success(`Found ${data.data.totalOrders} orders`);
      
    } catch (error: any) {
      console.error('Exception fetching orders:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to fetch orders: ${errorMessage}`);
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
                Fetching...
              </>
            ) : (
              'Search Orders'
            )}
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {searchStats && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">
              Found {searchStats.totalOrders} orders between {searchStats.dateRange.startDate} and {searchStats.dateRange.endDate}
            </p>
          </div>
        )}
        
        {orders.length > 0 && (
          <OrdersSearchTable 
            orders={orders} 
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
};
