
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../types";
import { Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface OrderDetailsTabProps {
  workOrder: WorkOrder;
}

export const OrderDetailsTab = ({
  workOrder
}: OrderDetailsTabProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
  
  // Format date function
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      console.error("Date parsing error:", error);
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

  // LDS information
  const ldsInfo = workOrder.lds || "N/A";

  return (
    <div className="space-y-4">
      {/* Merged Location and Time Information */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-blue-50 to-white">
        <div className="p-5 space-y-6">
          {/* Location Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800 text-lg">Location Information</h3>
            </div>
            
            <div className="grid grid-cols-[120px_1fr] gap-y-3 pl-7">
              <span className="text-sm font-medium text-gray-600">Name:</span>
              <span className="text-sm text-gray-700 font-medium">{locationName}</span>
              
              <span className="text-sm font-medium text-gray-600">Address:</span>
              <span className="text-sm text-gray-700">{fullAddress || "N/A"}</span>
            </div>
          </div>
          
          {/* Time Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800 text-lg">Time Information</h3>
            </div>
            
            <div className="grid grid-cols-[120px_1fr] gap-y-3 pl-7">
              <span className="text-sm font-medium text-gray-600">Start Time:</span>
              <span className="text-sm text-gray-700">{startTime}</span>
              
              <span className="text-sm font-medium text-gray-600">End Time:</span>
              <span className="text-sm text-gray-700">{endTime}</span>
              
              <span className="text-sm font-medium text-gray-600">LDS:</span>
              <span className="text-sm text-gray-700">{ldsInfo}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
