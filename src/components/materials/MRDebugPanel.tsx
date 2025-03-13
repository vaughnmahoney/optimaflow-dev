
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

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

  if (!isVisible) return null;

  return (
    <Card className="mt-4 bg-slate-50">
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
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-4 space-y-4">
                {routesResponse && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">OptimoRoute get_routes Response:</h3>
                    <pre className="bg-slate-100 p-3 rounded-md text-xs overflow-auto max-h-96">
                      {JSON.stringify(routesResponse, null, 2)}
                    </pre>
                  </div>
                )}

                {orderDetailsResponse && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">OptimoRoute Order Details Response:</h3>
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
