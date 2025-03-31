
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/components/workorders/types";
import { MapPin, Clock, Package, ClipboardCheck, ExternalLink, User } from "lucide-react";
import { format } from "date-fns";

interface OrderDetailsTabProps {
  workOrder: WorkOrder;
}

export const OrderDetailsTab = ({
  workOrder
}: OrderDetailsTabProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
  const searchData = workOrder.search_response?.data;
  const trackingUrl = completionData?.tracking_url;
  
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
    
  // Driver information
  const driverName = workOrder.driver?.name || "No Driver Assigned";

  return (
    <div className="p-4">
      <Card className="shadow-sm border-gray-200">
        <div className="p-0">
          {/* Header with tracking URL */}
          {trackingUrl && (
            <div className="p-3 pb-2 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-auto"
                onClick={() => window.open(trackingUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Tracking
              </Button>
            </div>
          )}
          
          {/* Content grid layout for more compact display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 p-4 pt-2">
            {/* Driver & Location Column */}
            <div className="space-y-4">
              {/* Driver Section */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                  <User className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Driver</h3>
                </div>
                <p className="text-sm pl-5.5">{driverName}</p>
              </div>
              
              {/* Location Section */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                  <MapPin className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Location</h3>
                </div>
                <div className="pl-5.5 space-y-1">
                  <p className="text-sm font-medium">{locationName}</p>
                  <p className="text-xs text-gray-600">{fullAddress}</p>
                </div>
              </div>
            </div>
            
            {/* Time & Materials Column */}
            <div className="space-y-4 mt-4 md:mt-0">
              {/* Time Details Section */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                  <Clock className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Time Details</h3>
                </div>
                <div className="pl-5.5 space-y-0.5">
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
              
              {/* Materials Section */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                  <Package className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Materials</h3>
                </div>
                <div className="pl-5.5 space-y-0.5">
                  <div className="grid grid-cols-[80px_1fr]">
                    <span className="text-xs text-gray-500">Quantity:</span>
                    <span className="text-xs">{materialQuantity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
