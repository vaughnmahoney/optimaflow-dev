
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BulkOrdersResponse } from "./types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ApiResponseDisplayProps {
  response: BulkOrdersResponse | null;
}

export const ApiResponseDisplay = ({ response }: ApiResponseDisplayProps) => {
  const [showFullResponse, setShowFullResponse] = useState(false);
  
  if (!response) return null;

  // Ensure we have consistent values for displaying counts
  const totalCount = response.totalCount || response.filteringMetadata?.unfilteredOrderCount;
  const filteredCount = response.filteredCount || response.filteringMetadata?.filteredOrderCount;
  const isComplete = response.isComplete || response.paginationProgress?.isComplete;
  
  // Create a simplified version of the response for initial display
  const simplifiedResponse = {
    totalCount,
    filteredCount,
    ordersCount: response.orders?.length || 0,
    isComplete,
    hasError: !!response.error,
    errorMessage: response.error,
    paginationProgress: response.paginationProgress,
    searchSuccess: response.searchResponse?.success,
    completionSuccess: response.completionResponse?.success,
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          API Response 
          {isComplete && (
            filteredCount !== undefined && totalCount !== undefined ? (
              ` (${filteredCount} completed orders of ${totalCount} total)`
            ) : totalCount !== undefined ? (
              ` (${totalCount} orders)`
            ) : null
          )}
          {!isComplete && response.paginationProgress?.totalOrdersRetrieved !== undefined && (
            ` (Retrieving data... ${response.paginationProgress.totalOrdersRetrieved} orders so far)`
          )}
          {response.after_tag && (
            <span className="block text-xs font-normal text-muted-foreground mt-1">
              Pagination active: after_tag present
            </span>
          )}
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
                  : isComplete
                    ? filteredCount !== undefined 
                      ? `Successfully retrieved ${filteredCount} orders with statuses: "success", "failed", "rejected" (filtered from ${totalCount} total orders)`
                      : `Successfully retrieved ${totalCount || 0} orders`
                    : `Data retrieval in progress... (${response.paginationProgress?.totalOrdersRetrieved || 0} orders so far)`}
              </p>
            </div>
            
            {/* Summary of API response */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <h3 className="text-sm font-medium mb-2">Response Summary:</h3>
              <div className="text-sm space-y-1">
                <p>Total orders: <span className="font-medium">{totalCount || 'N/A'}</span></p>
                {filteredCount !== undefined && (
                  <p>Filtered orders: <span className="font-medium">{filteredCount}</span></p>
                )}
                <p>Orders in response: <span className="font-medium">{response.orders?.length || 0}</span></p>
                {response.paginationProgress && (
                  <p>Pagination status: <span className="font-medium">{response.paginationProgress.isComplete ? 'Complete' : 'In progress'}</span></p>
                )}
                {response.batchStats && (
                  <>
                    <p>Total batches: <span className="font-medium">{response.batchStats.totalBatches}</span></p>
                    <p>Successful batches: <span className="font-medium">{response.batchStats.successfulBatches}</span></p>
                    <p>Failed batches: <span className="font-medium">{response.batchStats.failedBatches}</span></p>
                  </>
                )}
              </div>
            </div>
            
            {/* Collapsible full response data */}
            <Collapsible 
              open={showFullResponse} 
              onOpenChange={setShowFullResponse}
              className="border rounded"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center justify-between w-full p-3 border-b bg-slate-50 hover:bg-slate-100"
                >
                  <span className="font-medium text-sm">
                    {showFullResponse ? "Hide Full Response" : "View Full Response"}
                  </span>
                  {showFullResponse ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="overflow-auto p-3">
                  <pre className="bg-slate-50 p-4 rounded text-xs max-h-[300px] overflow-auto">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {/* Simplified JSON view - always visible */}
            <div className="overflow-auto">
              <h3 className="text-sm font-medium mb-2">Response Data (Summary):</h3>
              <pre className="bg-slate-50 p-4 rounded text-xs max-h-[150px] overflow-auto">
                {JSON.stringify(simplifiedResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
