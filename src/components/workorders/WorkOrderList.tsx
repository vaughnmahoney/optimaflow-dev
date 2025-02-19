
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
  const transformResponse = (data: any) => {
    if (!data) return null;
    
    return {
      Order: {
        ID: data.id,
        Number: data.order_no || data.external_id,
        Status: data.status,
        Date: data.service_date,
      },
      Location: {
        Name: data.location?.name,
        Address: data.location?.address,
        Coordinates: data.location?.coordinates,
      },
      ServiceDetails: {
        Notes: data.service_notes,
        Description: data.description,
        CustomFields: data.custom_fields,
      },
      CompletionInfo: {
        Status: data.completion_data?.data?.status,
        Images: data.completion_data?.data?.form?.images?.length || 0,
        HasSignature: !!data.completion_data?.data?.form?.signature,
        Notes: data.completion_data?.data?.form?.note,
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
        toast.success("Work order imported successfully");
        setOptimoSearch("");
        onSearchChange("");
      } else {
        toast.error(data?.error || "No work order found with that number");
      }
    } catch (error: any) {
      console.error('OptimoRoute search error:', error);
      toast.error(`Failed to import work order: ${error.message}`);
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
            {isSearching ? 'Importing...' : 'Import'}
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchQuery } = await req.json()
    
    const response = await fetch(
      \`https://api.optimoroute.com/v1/orders/\${searchQuery}\`,
      {
        headers: {
          'Authorization': \`Bearer \${optimoRouteApiKey}\`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
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
