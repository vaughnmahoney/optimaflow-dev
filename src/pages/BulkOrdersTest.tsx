
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";

interface BulkOrdersResponse {
  success?: boolean;
  error?: string;
  orders?: any[];
  totalCount?: number;
}

const BulkOrdersTest = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BulkOrdersResponse | null>(null);
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);

  const fetchBulkOrders = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      // Format dates as ISO strings
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("bulk-get-orders", {
        body: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });

      if (error) {
        console.error("Error fetching bulk orders:", error);
        toast.error(`Error: ${error.message}`);
        setResponse({ error: error.message });
      } else {
        console.log("Bulk orders response:", data);
        setResponse(data);
        toast.success(`Retrieved ${data.totalCount || 0} orders`);
      }
    } catch (error) {
      console.error("Exception fetching bulk orders:", error);
      toast.error(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      setResponse({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Bulk Orders API Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setOpenStartDate(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setOpenEndDate(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Button 
            className="mt-4" 
            onClick={fetchBulkOrders} 
            disabled={isLoading || !startDate || !endDate}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching Orders...
              </>
            ) : (
              "Fetch Bulk Orders"
            )}
          </Button>
        </CardContent>
      </Card>
      
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>
              API Response 
              {response.totalCount !== undefined && ` (${response.totalCount} orders)`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {response.error ? (
              <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
                <h3 className="font-medium">Error:</h3>
                <p>{response.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                  <p className="font-medium text-green-800">
                    Successfully retrieved data from OptimoRoute API
                  </p>
                </div>
                
                <div className="overflow-auto">
                  <pre className="bg-slate-50 p-4 rounded text-xs max-h-[600px] overflow-auto">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkOrdersTest;
