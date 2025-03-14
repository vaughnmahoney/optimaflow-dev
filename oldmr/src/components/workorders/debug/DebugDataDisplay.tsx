
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DebugDataDisplayProps {
  searchResponse: any;
  transformedData: any;
}

export const DebugDataDisplay = ({
  searchResponse,
  transformedData,
}: DebugDataDisplayProps) => {
  if (!searchResponse) return null;

  return (
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
  );
};
