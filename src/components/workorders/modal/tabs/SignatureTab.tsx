
import { Card } from "@/components/ui/card";
import { WorkOrder } from "@/components/workorders/types";

interface SignatureTabProps {
  workOrder: WorkOrder;
}

export const SignatureTab = ({ workOrder }: SignatureTabProps) => {
  const signatureUrl = workOrder.completion_response?.orders[0]?.data?.form?.signature?.url;

  return (
    <div className="p-4">
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-4 space-y-2">
          <div className="flex items-center">
            <h4 className="text-sm font-medium text-gray-700">Customer Signature</h4>
          </div>
          
          <div className="pl-6 pt-2">
            {signatureUrl ? (
              <div className="p-4 border border-gray-100 rounded-md bg-gray-50 w-full flex justify-center">
                <img 
                  src={signatureUrl} 
                  alt="Signature" 
                  className="max-w-full max-h-[300px] object-contain"
                  onError={(e) => {
                    // Add fallback for broken signature images
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTQgM3Y0YTEgMSAwIDAgMCAxIDFoNCI+PC9wYXRoPjxwYXRoIGQ9Ik0xNyAyMWgtMTBhMiAyIDAgMCAxLTItMnYtMTRhMiAyIDAgMCAxIDItMmg3bDUgNXYxMWEyIDIgMCAwIDEtMiAyeiI+PC9wYXRoPjxwYXRoIGQ9Ik05IDlsNiA2Ij48L3BhdGg+PHBhdGggZD0iTTE1IDlsLTYgNiI+PC9wYXRoPjwvc3ZnPg==';
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-8 px-6 bg-gray-50 border border-gray-100 rounded-md w-full">
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
