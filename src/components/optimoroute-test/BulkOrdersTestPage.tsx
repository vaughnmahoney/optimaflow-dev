
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from './DatePickerWithRange';
import { BulkOrdersTable } from './BulkOrdersTable';
import { useToast } from '@/hooks/use-toast';
import { useBulkOrdersFetch } from '@/hooks/useBulkOrdersFetch';
import { DateRange } from 'react-day-picker';
import { LoadingSkeleton } from '@/components/workorders/LoadingSkeleton';

export const BulkOrdersTestPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { fetchBulkOrders, bulkOrders, isLoading, error } = useBulkOrdersFetch();

  const handleSearch = async () => {
    if (!dateRange?.from) {
      toast({
        title: "Date required",
        description: "Please select at least a start date",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      await fetchBulkOrders(dateRange);
    } catch (error) {
      console.error("Error fetching bulk orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Bulk Orders API Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Fetch Bulk Orders</CardTitle>
          <CardDescription>
            Test the OptimoRoute bulk_get_orders API endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <DatePickerWithRange dateRange={dateRange} onDateRangeChange={setDateRange} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || isSearching || !dateRange?.from}
          >
            {isLoading || isSearching ? "Loading..." : "Fetch Orders"}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : bulkOrders && bulkOrders.length > 0 ? (
        <BulkOrdersTable orders={bulkOrders} />
      ) : bulkOrders?.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No orders found for the selected date range.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
