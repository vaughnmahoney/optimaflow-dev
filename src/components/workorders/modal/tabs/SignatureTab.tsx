
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../types";
import { FileSignature } from "lucide-react";

interface SignatureTabProps {
  workOrder: WorkOrder;
}

export const SignatureTab = ({
  workOrder
}: SignatureTabProps) => {
  const signatureUrl = workOrder.completion_response?.orders[0]?.data?.form?.signature?.url;

  return (
    <div>
      <Card className="overflow-hidden border-l-4 border-l-blue-400">
        <div className="bg-gradient-to-r from-blue-50 to-transparent p-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <FileSignature className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium text-blue-700">Customer Signature</h3>
          </div>
        </div>
        <div className="p-4 flex flex-col items-center">
          {signatureUrl ? (
            <div className="p-4 border border-gray-100 rounded-md bg-gray-50 w-full flex justify-center">
              <img src={signatureUrl} alt="Signature" className="max-w-full max-h-[300px]" />
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-gray-50 border border-gray-100 rounded-md w-full">
              <FileSignature className="h-10 w-10 text-blue-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No signature available</p>
              <p className="text-xs text-gray-400 mt-1">This work order doesn't have a signature attached</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
