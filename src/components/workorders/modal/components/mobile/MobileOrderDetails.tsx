
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WorkOrder } from "../../../types";
import { MapPin, Clock, Package, ClipboardCheck, FileSignature, User } from "lucide-react";
import { format } from "date-fns";

interface MobileOrderDetailsProps {
  workOrder: WorkOrder;
}

export const MobileOrderDetails = ({
  workOrder
}: MobileOrderDetailsProps) => {
  const completionData = workOrder.completion_response?.orders?.[0]?.data;
  const searchData = workOrder.search_response?.data;
  const signatureUrl = completionData?.form?.signature?.url;
  
  // Driver info
  const driverName = workOrder.search_response?.scheduleInformation?.driverName || 'No Driver Assigned';
  
  // Format date function
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Get formatted start and end times
  const startTime = completionData?.startTime?.localTime 
    ? formatDate(completionData.startTime.localTime) 
    : "Not recorded";
  
  const endTime = completionData?.endTime?.localTime 
    ? formatDate(completionData.endTime.localTime) 
    : "Not recorded";

  // Location information
  const location = workOrder.location || {};
  const locationName = location.name || location.locationName || "N/A";
  const address = location.address || "N/A";
  const city = location.city || "";
  const state = location.state || "";
  const zip = location.zip || "";
  
  // Format full address
  const fullAddress = [
    address,
    [city, state, zip].filter(Boolean).join(", ")
  ].filter(part => part && part !== "N/A").join(", ");

  // Extract material quantity
  const materialQuantity = searchData?.customField3 || "N/A";
  
  // Format LDS information
  const ldsRaw = searchData?.customField5 || workOrder.lds || "N/A";
  const ldsInfo = ldsRaw !== "N/A" && ldsRaw.includes(" ") 
    ? ldsRaw.split(" ")[0] // Take only the date part from "2024-10-17 00:00"
    : ldsRaw;

  return (
    <div className="space-y-4">
      {/* Main Order Details Card */}
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-4 space-y-4">
          {/* Driver Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Driver</span>
            </div>
            <p className="text-sm text-gray-700 pl-6">{driverName}</p>
          </div>
          
          <Separator className="bg-gray-100" />
          
          {/* Location Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Location</span>
            </div>
            <div className="pl-6 space-y-1">
              <p className="text-sm font-medium text-gray-700">{locationName}</p>
              <p className="text-sm text-gray-600">{fullAddress}</p>
            </div>
          </div>
          
          <Separator className="bg-gray-100" />
          
          {/* Time Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Time Details</span>
            </div>
            <div className="pl-6 grid grid-cols-2 gap-2">
              <p className="text-sm text-gray-600">Start Time:</p>
              <p className="text-sm text-gray-700">{startTime}</p>
              
              <p className="text-sm text-gray-600">End Time:</p>
              <p className="text-sm text-gray-700">{endTime}</p>
              
              <p className="text-sm text-gray-600">LDS:</p>
              <p className="text-sm text-gray-700">{ldsInfo}</p>
            </div>
          </div>
          
          <Separator className="bg-gray-100" />
          
          {/* Materials Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Materials</span>
            </div>
            <div className="pl-6 grid grid-cols-2 gap-2">
              <p className="text-sm text-gray-600">Quantity:</p>
              <p className="text-sm text-gray-700">{materialQuantity}</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Signature Card */}
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
            <FileSignature className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Customer Signature</span>
          </div>
          
          <div className="flex justify-center">
            {signatureUrl ? (
              <div className="p-3 border border-gray-100 rounded-md bg-gray-50 w-full flex justify-center">
                <img 
                  src={signatureUrl} 
                  alt="Signature" 
                  className="max-w-full max-h-[150px] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTQgM3Y0YTEgMSAwIDAgMCAxIDFoNCI+PC9wYXRoPjxwYXRoIGQ9Ik0xNyAyMWgtMTBhMiAyIDAgMCAxLTItMnYtMTRhMiAyIDAgMCAxIDItMmg3bDUgNXYxMWEyIDIgMCAwIDEtMiAyeiI+PC9wYXRoPjxwYXRoIGQ9Ik05IDlsNiA2Ij48L3BhdGg+PHBhdGggZD0iTTE1IDlsLTYgNiI+PC9wYXRoPjwvc3ZnPg==';
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-gray-50 border border-gray-100 rounded-md w-full">
                <FileSignature className="h-8 w-8 text-blue-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No signature available</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
