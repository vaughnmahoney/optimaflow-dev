
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../../../types";
import { MapPin, Clock, User } from "lucide-react";
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

  return (
    <Card className="border-gray-100">
      <div className="space-y-4">
        {/* Top Row - Location (left) and Driver (right) */}
        <div className="flex flex-row px-4 pt-4">
          {/* Location Section - Left side */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-1.5 text-gray-700 mb-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-medium">Location</h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{locationName}</p>
              <p className="text-xs text-gray-600">{fullAddress}</p>
            </div>
          </div>
          
          {/* Driver Section - Right side */}
          <div className="space-y-1.5 ml-4">
            <div className="flex items-center gap-1.5 text-gray-700 mb-1">
              <User className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-medium">Driver</h3>
            </div>
            <p className="text-sm">{driverName}</p>
          </div>
        </div>
        
        {/* Time Details Section */}
        <div className="space-y-1.5 px-4 pb-4">
          <div className="flex items-center gap-1.5 text-gray-700 mb-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-medium">Time Details</h3>
          </div>
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
      </div>
    </Card>
  );
};
