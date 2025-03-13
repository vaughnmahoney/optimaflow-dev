
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";

interface MRDebugPanelProps {
  routesResponse: any;
  orderDetailsResponse: any;
  isVisible: boolean;
}

export const MRDebugPanel = ({ 
  routesResponse, 
  orderDetailsResponse, 
  isVisible 
}: MRDebugPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Determine if there's an error to highlight
  const hasError = orderDetailsResponse?.error || (orderDetailsResponse?.success === false);

  if (!isVisible) return null;

  return (
    <Card className={`mt-4 ${hasError ? 'bg-red-50' : 'bg-slate-50'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-base">
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger className="flex items-center w-full text-left">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              API Response Debugging
              {hasError && (
                <AlertTriangle className="h-4 w-4 ml-2 text-red-600" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-4 space-y-4">
                {/* Batch statistics section (if available) */}
                {orderDetailsResponse?.batchStats && (
                  <div className={`${hasError ? 'bg-red-100' : 'bg-blue-100'} border border-blue-300 p-3 rounded-md`}>
                    <h3 className="text-sm font-semibold mb-1">Batch Statistics:</h3>
                    <ul className="text-sm space-y-1">
                      <li>Total Batches: {orderDetailsResponse.batchStats.totalBatches}</li>
                      <li>Completed Batches: {orderDetailsResponse.batchStats.completedBatches}</li>
                      <li>Failed Batches: {orderDetailsResponse.batchStats.failedBatches}</li>
                    </ul>
                  </div>
                )}
                
                {/* Error display section */}
                {hasError && (
                  <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-md">
                    <h3 className="text-sm font-semibold mb-1">Error:</h3>
                    <p className="text-sm">{orderDetailsResponse?.error || "Unknown error"}</p>
                    
                    {orderDetailsResponse?.requestedOrderNumbers && (
                      <div className="mt-2">
                        <h4 className="text-xs font-medium">Requested Order Numbers:</h4>
                        <pre className="text-xs mt-1 bg-white p-2 rounded">
                          {JSON.stringify(orderDetailsResponse.requestedOrderNumbers, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {orderDetailsResponse?.parsedError && (
                      <div className="mt-2">
                        <h4 className="text-xs font-medium">Parsed Error:</h4>
                        <pre className="text-xs mt-1 bg-white p-2 rounded">
                          {JSON.stringify(orderDetailsResponse.parsedError, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {routesResponse && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">OptimoRoute get_routes Response:</h3>
                    
                    {/* Summary section for routes */}
                    <div className="bg-white p-3 rounded-md text-xs mb-2">
                      <h4 className="font-medium mb-1">Quick Summary:</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Routes: {routesResponse.routes?.length || 0}</li>
                        <li>Total Stops: {
                            routesResponse.routes?.reduce(
                              (total: number, route: any) => total + (route.stops?.length || 0), 
                              0
                            ) || 0
                          }
                        </li>
                        <li>
                          Order Numbers: {
                            routesResponse.routes?.reduce(
                              (orders: string[], route: any) => [
                                ...orders, 
                                ...(route.stops?.map((stop: any) => stop.orderNo) || [])
                              ], 
                              []
                            ).filter((orderNo: string) => orderNo !== "-").length || 0
                          }
                        </li>
                      </ul>
                    </div>
                    
                    <pre className="bg-slate-100 p-3 rounded-md text-xs overflow-auto max-h-96">
                      {JSON.stringify(routesResponse, null, 2)}
                    </pre>
                  </div>
                )}

                {orderDetailsResponse && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">OptimoRoute Order Details Response:</h3>
                    
                    {/* Summary section for order details */}
                    <div className="bg-white p-3 rounded-md text-xs mb-2">
                      <h4 className="font-medium mb-1">Quick Summary:</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Success: {orderDetailsResponse.success ? 'Yes' : 'No'}</li>
                        <li>Found Orders: {orderDetailsResponse.orders?.length || 0}</li>
                        <li>Total Requested: {orderDetailsResponse.totalRequested || 'Unknown'}</li>
                        {orderDetailsResponse.orderSummary && (
                          <li>Order Summary Available: Yes</li>
                        )}
                        {orderDetailsResponse.batchStats && (
                          <li>Batches: {orderDetailsResponse.batchStats.completedBatches}/{orderDetailsResponse.batchStats.totalBatches}</li>
                        )}
                      </ul>
                    </div>
                    
                    {/* Order summary section */}
                    {orderDetailsResponse.orderSummary && (
                      <div className="mb-2">
                        <h4 className="text-xs font-medium mb-1">Order Summary:</h4>
                        <pre className="bg-white p-3 rounded-md text-xs overflow-auto max-h-60">
                          {JSON.stringify(orderDetailsResponse.orderSummary, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <pre className="bg-slate-100 p-3 rounded-md text-xs overflow-auto max-h-96">
                      {JSON.stringify(orderDetailsResponse, null, 2)}
                    </pre>
                  </div>
                )}

                {!routesResponse && !orderDetailsResponse && (
                  <p className="text-sm text-muted-foreground">No API responses available yet</p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};
