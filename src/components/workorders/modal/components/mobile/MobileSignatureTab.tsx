
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../../types";

interface MobileSignatureTabProps {
  workOrder: WorkOrder;
}

export const MobileSignatureTab = ({ workOrder }: MobileSignatureTabProps) => {
  const signatureUrl = workOrder.completion_response?.orders?.[0]?.data?.form?.signature?.url;

  return (
    <>
      {signatureUrl ? (
        <Card className="border-gray-100">
          <div className="px-4 py-4 space-y-2">
            <div className="flex items-center gap-1.5 text-gray-700">
              <h3 className="text-sm font-medium">Customer Signature</h3>
            </div>
            
            <div className="flex justify-center">
              <div className="border border-gray-100 rounded-md bg-gray-50 p-2 w-full flex justify-center">
                <img 
                  src={signatureUrl} 
                  alt="Signature" 
                  className="max-w-full max-h-[200px] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTQgM3Y0YTEgMSAwIDAgMCAxIDFoNCI+PC9wYXRoPjxwYXRoIGQ9Ik0xNyAyMWgtMTBhMiAyIDAgMCAxLTItMnYtMTRhMiAyIDAgMCAxIDItMmg3bDUgNXYxMWEyIDIgMCAwIDEtMiAyeiI+PC9wYXRoPjxwYXRoIGQ9Ik05IDlsNiA2Ij48L3BhdGg+PHBhdGggZD0iTTE1IDlsLTYgNiI+PC9wYXRoPjwvc3ZnPg==';
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-gray-100">
          <div className="p-4">
            <div className="text-center py-10">
              <p className="text-gray-500 font-medium">No signature available</p>
              <p className="text-xs text-gray-400 mt-1">This work order doesn't have a signature attached</p>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
