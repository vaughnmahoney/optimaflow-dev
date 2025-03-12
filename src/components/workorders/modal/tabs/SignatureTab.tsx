
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
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <FileSignature className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-800 text-lg">Customer Signature</h3>
          </div>
          
          <div className="pl-7 pt-2">
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
        </div>
      </Card>
    </div>
  );
};
