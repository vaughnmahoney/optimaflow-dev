
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/components/workorders/types";
import { ExternalLink } from "lucide-react";
import { formatLocalTime } from "@/utils/dateUtils";

interface OrderDetailsTabProps {
  workOrder: WorkOrder;
}

export const OrderDetailsTab = ({
  workOrder
}: OrderDetailsTabProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
  const searchData = workOrder.search_response?.data;
  const trackingUrl = completionData?.tracking_url;
  
  // Get formatted start and end times
  const startTime = completionData?.startTime?.localTime 
    ? formatLocalTime(completionData.startTime.localTime) 
    : "Not recorded";
  
  const endTime = completionData?.endTime?.localTime 
    ? formatLocalTime(completionData.endTime.localTime) 
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
      <Card className="shadow-sm border-gray-100">
        <div className="p-4 space-y-4">
          {/* Top row with tracking button if available */}
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium text-gray-800">Order Details</h3>
            {trackingUrl && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                onClick={() => window.open(trackingUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                View Tracking
              </Button>
            )}
          </div>
          
          <Separator className="bg-gray-100" />
          
          {/* Driver Section - Now at the top */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Driver</h4>
            <p className="text-sm text-gray-700">{driverName}</p>
          </div>
          
          <Separator className="bg-gray-100" />
          
          {/* Location Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Location</h4>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-gray-700">{locationName}</p>
              <p className="text-sm text-gray-600">{fullAddress}</p>
            </div>
          </div>
          
          <Separator className="bg-gray-100" />
          
          {/* Time Details Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Time Details</h4>
            <div className="grid grid-cols-[100px_1fr] gap-y-1">
              <span className="text-sm text-gray-600">Start Time:</span>
              <span className="text-sm text-gray-700">{startTime}</span>
              
              <span className="text-sm text-gray-600">End Time:</span>
              <span className="text-sm text-gray-700">{endTime}</span>
              
              <span className="text-sm text-gray-600">LDS:</span>
              <span className="text-sm text-gray-700">{ldsInfo}</span>
            </div>
          </div>
          
          <Separator className="bg-gray-100" />
          
          {/* Materials Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Materials</h4>
            <div className="grid grid-cols-[100px_1fr] gap-y-1">
              <span className="text-sm text-gray-600">Quantity:</span>
              <span className="text-sm text-gray-700">{materialQuantity}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
