
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../../../types";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface MobileDetailsTabProps {
  workOrder: WorkOrder;
}

export const MobileDetailsTab = ({ workOrder }: MobileDetailsTabProps) => {
  const completionData = workOrder.completion_response?.orders?.[0]?.data;
  const searchData = workOrder.search_response?.data;
  
  // Driver info
  const driverName = workOrder.search_response?.scheduleInformation?.driverName || workOrder.driver?.name || 'No Driver Assigned';
  
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

  // Format LDS information
  const ldsRaw = searchData?.customField5 || workOrder.lds || "N/A";
  const ldsInfo = ldsRaw !== "N/A" && ldsRaw.includes(" ") 
    ? ldsRaw.split(" ")[0] // Take only the date part from "2024-10-17 00:00"
    : ldsRaw;

  // Extract material quantity
  const materialQuantity = searchData?.customField3 || "N/A";

  return (
    <Card className="border-gray-100">
      <div className="p-4 space-y-4">
        {/* Driver Section - Now first */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-medium text-gray-700">Driver</h4>
          <p className="text-sm">{driverName}</p>
        </div>
        
        <Separator className="bg-gray-100" />
        
        {/* Location Section */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-medium text-gray-700">Location</h4>
          <div className="space-y-1">
            <p className="text-sm font-medium">{locationName}</p>
            <p className="text-xs text-gray-600">{fullAddress}</p>
          </div>
        </div>
        
        <Separator className="bg-gray-100" />
        
        {/* Time Details Section */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-medium text-gray-700">Time Details</h4>
          <div className="space-y-0.5">
            <div className="grid grid-cols-[80px_1fr]">
              <span className="text-xs text-gray-500">Start Time:</span>
              <span className="text-xs">{startTime}</span>
            </div>
            <div className="grid grid-cols-[80px_1fr]">
              <span className="text-xs text-gray-500">End Time:</span>
              <span className="text-xs">{endTime}</span>
            </div>
            <div className="grid grid-cols-[80px_1fr]">
              <span className="text-xs text-gray-500">LDS:</span>
              <span className="text-xs">{ldsInfo}</span>
            </div>
          </div>
        </div>
        
        <Separator className="bg-gray-100" />
        
        {/* Materials Section */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-medium text-gray-700">Materials</h4>
          <div className="grid grid-cols-[80px_1fr]">
            <span className="text-xs text-gray-500">Quantity:</span>
            <span className="text-xs">{materialQuantity}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
