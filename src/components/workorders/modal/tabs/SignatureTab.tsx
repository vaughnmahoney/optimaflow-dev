
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkOrder } from "../../types";

interface SignatureTabProps {
  workOrder: WorkOrder;
}

export const SignatureTab = ({
  workOrder
}: SignatureTabProps) => {
  const signatureUrl = workOrder.completion_response?.orders[0]?.data?.form?.signature?.url;

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 px-[8px] py-[29px]">
        <Card className="p-4">
          {signatureUrl ? (
            <img src={signatureUrl} alt="Signature" className="max-w-full" />
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
