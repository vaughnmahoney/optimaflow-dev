
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BulkOrdersResponse {
  success?: boolean;
  error?: string;
  orders?: any[];
  totalCount?: number;
  searchResponse?: any;
  completionResponse?: any;
}

const BulkOrdersTest = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BulkOrdersResponse | null>(null);
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [activeTab, setActiveTab] = useState("search-only");

  const fetchOrders = async () => {
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

      let endpoint;
      let logMessage;
      
      if (activeTab === "search-only") {
        endpoint = "bulk-get-orders";
        logMessage = "Calling bulk-get-orders (search_orders only)";
      } else {
        endpoint = "get-orders-with-completion";
        logMessage = "Calling get-orders-with-completion (search_orders + get_completion_details)";
      }
      
      console.log(`${logMessage} with dates: ${formattedStartDate} to ${formattedEndDate}`);

      // Call the selected edge function
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });

      if (error) {
        console.error(`Error fetching orders:`, error);
        toast.error(`Error: ${error.message}`);
        setResponse({ error: error.message });
      } else {
        console.log("API response:", data);
        
        // Add specific messaging if API returned success:false
        if (data.searchResponse && data.searchResponse.success === false) {
          toast.warning(`Search API returned: ${data.searchResponse.code || 'Unknown error'} - ${data.searchResponse.message || ''}`);
        } else if (data.completionResponse && data.completionResponse.success === false) {
          toast.warning(`Completion API returned: ${data.completionResponse.code || 'Unknown error'} - ${data.completionResponse.message || ''}`);
        } else {
          toast.success(`Retrieved ${data.totalCount || 0} orders`);
        }
        
        setResponse(data);
      }
    } catch (error) {
      console.error("Exception fetching orders:", error);
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search-only">Search Only</TabsTrigger>
              <TabsTrigger value="with-completion">With Completion Details</TabsTrigger>
            </TabsList>
            <TabsContent value="search-only" className="mt-2 text-sm text-muted-foreground">
              Uses search_orders endpoint to retrieve basic order data by date range.
            </TabsContent>
            <TabsContent value="with-completion" className="mt-2 text-sm text-muted-foreground">
              Uses search_orders + get_completion_details to retrieve full order data including images.
            </TabsContent>
          </Tabs>
          
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
            onClick={fetchOrders} 
            disabled={isLoading || !startDate || !endDate}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {activeTab === "search-only" ? "Fetching Orders..." : "Fetching Orders with Completion Data..."}
              </>
            ) : (
              activeTab === "search-only" ? "Fetch Orders" : "Fetch Orders with Completion Data"
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
                <div className={`border rounded p-4 mb-4 ${
                  (response.searchResponse && response.searchResponse.success === false) ||
                  (response.completionResponse && response.completionResponse.success === false)
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <p className={`font-medium ${
                    (response.searchResponse && response.searchResponse.success === false) ||
                    (response.completionResponse && response.completionResponse.success === false)
                      ? 'text-yellow-800' 
                      : 'text-green-800'
                  }`}>
                    {response.searchResponse && response.searchResponse.success === false 
                      ? `Search API Response: ${response.searchResponse.code || 'Unknown error'} ${response.searchResponse.message ? `- ${response.searchResponse.message}` : ''}`
                      : response.completionResponse && response.completionResponse.success === false
                      ? `Completion API Response: ${response.completionResponse.code || 'Unknown error'} ${response.completionResponse.message ? `- ${response.completionResponse.message}` : ''}`
                      : 'Successfully retrieved data from OptimoRoute API'}
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
