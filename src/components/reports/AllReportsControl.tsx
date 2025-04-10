
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ArrowRightIcon, RefreshCw } from "lucide-react";
import { useFetchAllReports } from "@/hooks/useFetchAllReports";
import { Progress } from "@/components/ui/progress";

export const AllReportsControl: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  
  const { fetchAllReports, isLoading, results } = useFetchAllReports();
  
  const handleFetch = () => {
    if (!startDate || !endDate) {
      return;
    }
    
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    
    fetchAllReports(formattedStartDate, formattedEndDate);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update LDS Data</CardTitle>
        <CardDescription>
          Fetch and update Last Delivery Service dates for all orders in the selected date range
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PP') : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setStartCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center justify-center mt-4 sm:mt-0">
            <ArrowRightIcon className="h-4 w-4" />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PP') : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setEndCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {isLoading && (
          <div className="mt-4">
            <Progress value={undefined} className="h-2 mb-2" />
            <p className="text-sm text-center text-muted-foreground">
              Fetching and updating LDS data...
            </p>
          </div>
        )}
        
        {results && !isLoading && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Results:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-sm">Total Orders: <span className="font-medium">{results.totalOrders}</span></p>
                <p className="text-sm">Orders Processed: <span className="font-medium">{results.ordersProcessed}</span></p>
                <p className="text-sm">Orders With LDS Data: <span className="font-medium">{results.ordersWithLdsData}</span></p>
              </div>
              <div>
                <p className="text-sm">Updated in Database: <span className="font-medium">{results.updatedInDatabase}</span></p>
                <p className="text-sm">Errors: <span className="font-medium">{results.errors}</span></p>
                <p className="text-sm">Date Range: <span className="font-medium">{results.dateRange?.startDate} to {results.dateRange?.endDate}</span></p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleFetch} 
          disabled={isLoading || !startDate || !endDate}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Fetch and Update LDS Data'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
