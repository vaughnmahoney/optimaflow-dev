
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageViewDialog } from "./ImageViewDialog";
import { WorkOrderTable } from "./WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useState } from "react";
import { WorkOrderListProps } from "./types";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const WorkOrderList = ({ 
  workOrders, 
  isLoading,
  onSearchChange,
  onStatusFilterChange,
  onStatusUpdate,
  searchQuery,
  statusFilter
}: WorkOrderListProps) => {
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const [optimoSearch, setOptimoSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);

  // Import function that transforms the data
  const transformResponse = (response: any) => {
    if (!response?.orders?.[0]) return null;
    
    const order = response.orders[0];
    return {
      Order: {
        ID: order.id,
        Number: order.orderNo || order.id,
        Status: order.status,
        Date: order.date,
      },
      Location: {
        Name: order.location?.name,
        Address: order.location?.address,
        Coordinates: order.location?.coordinates,
      },
      ServiceDetails: {
        Notes: order.notes,
        Description: order.serviceDescription,
        CustomFields: order.customFields,
      },
      CompletionInfo: {
        Status: response.completion_data?.status,
        Images: response.completion_data?.photos?.length || 0,
        HasSignature: response.completion_data?.signatures?.length > 0,
        Notes: response.completion_data?.notes,
      }
    };
  };

  const handleOptimoSearch = async () => {
    if (!optimoSearch.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-optimoroute', {
        body: { searchQuery: optimoSearch }
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      console.log('Response from function:', data);
      setSearchResponse(data);
      setTransformedData(transformResponse(data));

      if (data?.success) {
        toast.success("Work order found");
        setOptimoSearch("");
      } else {
        toast.error(data?.error || "No work order found with that number");
      }
    } catch (error: any) {
      console.error('OptimoRoute search error:', error);
      toast.error(`Failed to find work order: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Import OptimoRoute order #"
            value={optimoSearch}
            onChange={(e) => setOptimoSearch(e.target.value)}
            className="w-64"
          />
          <Button 
            variant="secondary"
            onClick={handleOptimoSearch}
            disabled={!optimoSearch.trim() || isSearching}
          >
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => onStatusFilterChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Debug Data Display */}
      {searchResponse && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Raw JSON Response</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto max-h-96 bg-slate-50 p-4 rounded-md">
                  {JSON.stringify(searchResponse, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transformed Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto max-h-96 bg-slate-50 p-4 rounded-md">
                  {JSON.stringify(transformedData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Import Logic Display */}
          <Card>
            <CardHeader>
              <CardTitle>Import & Transform Logic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Edge Function Call:</h3>
                  <pre className="text-xs bg-slate-50 p-4 rounded-md">
{`const { data, error } = await supabase.functions.invoke('search-optimoroute', {
  body: { searchQuery: optimoSearch }
});`}
                  </pre>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Edge Function Code:</h3>
                  <pre className="text-xs bg-slate-50 p-4 rounded-md">
{`// supabase/functions/search-optimoroute/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY')
const baseUrl = 'https://api.optimoroute.com/v1'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchQuery } = await req.json()
    console.log('Received search query:', searchQuery)
    
    // 1. First get the order details
    const searchResponse = await fetch(
      \`\${baseUrl}/search_orders?key=\${optimoRouteApiKey}\`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          includeOrderData: true,
          includeScheduleInformation: true
        })
      }
    )

    const searchData = await searchResponse.json()
    console.log('Search response:', searchData)
    
    // Check if we found any orders
    if (!searchData.orders || searchData.orders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order not found', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Then get the completion details
    const completionResponse = await fetch(
      \`\${baseUrl}/get_completion_details?key=\${optimoRouteApiKey}\`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: searchQuery
        })
      }
    )

    const completionData = await completionResponse.json()
    console.log('Completion data:', completionData)

    // 3. Combine the data
    return new Response(
      JSON.stringify({
        success: true,
        orders: searchData.orders,
        completion_data: completionData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <WorkOrderTable 
        workOrders={workOrders}
        onStatusUpdate={onStatusUpdate}
        onImageView={setSelectedWorkOrderId}
      />

      <ImageViewDialog 
        workOrderId={selectedWorkOrderId} 
        onClose={() => setSelectedWorkOrderId(null)}
        onStatusUpdate={onStatusUpdate}
        workOrders={workOrders}
      />
    </div>
  );
};
