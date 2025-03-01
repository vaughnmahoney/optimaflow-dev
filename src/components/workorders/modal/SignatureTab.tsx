
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../types";

interface SignatureTabProps {
  workOrder: WorkOrder;
}

export const SignatureTab = ({ workOrder }: SignatureTabProps) => {
  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <Card className="p-4">
          {workOrder.signature_url ? (
            <img 
              src={workOrder.signature_url} 
              alt="Signature" 
              className="max-w-full"
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No signature available
            </div>
          )}
        </Card>
      </div>
    </ScrollArea>
  );
};
