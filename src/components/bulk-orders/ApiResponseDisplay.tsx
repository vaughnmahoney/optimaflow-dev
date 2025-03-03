
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BulkOrdersResponse } from "./types";

interface ApiResponseDisplayProps {
  response: BulkOrdersResponse | null;
}

export const ApiResponseDisplay = ({ response }: ApiResponseDisplayProps) => {
  if (!response) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          API Response 
          {response.paginationProgress?.isComplete && (
            response.filteredCount !== undefined && response.totalCount !== undefined ? (
              ` (${response.filteredCount} completed orders of ${response.totalCount} total)`
            ) : response.totalCount !== undefined ? (
              ` (${response.totalCount} orders)`
            ) : null
          )}
          {!response.paginationProgress?.isComplete && response.paginationProgress?.totalOrdersRetrieved !== undefined && (
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
                  : response.paginationProgress?.isComplete
                    ? response.filteredCount !== undefined 
                      ? `Successfully retrieved ${response.filteredCount} completed orders with status "success" (filtered from ${response.totalCount} total orders)`
                      : `Successfully retrieved ${response.totalCount || 0} orders`
                    : `Data retrieval in progress... (${response.paginationProgress?.totalOrdersRetrieved || 0} orders so far)`}
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
  );
};
