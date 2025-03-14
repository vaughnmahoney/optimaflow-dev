
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "../../types";
import { MapPin, Clock, Package, ClipboardCheck, ExternalLink } from "lucide-react";
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

  // Extract material quantity
  const materialQuantity = searchData?.customField3 || "N/A";
  
  // Format LDS information
  const ldsRaw = searchData?.customField5 || workOrder.lds || "N/A";
  const ldsInfo = ldsRaw !== "N/A" && ldsRaw.includes(" ") 
    ? ldsRaw.split(" ")[0] // Take only the date part from "2024-10-17 00:00"
    : ldsRaw;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-5 space-y-4">
          {/* Main Order Details Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-800 text-lg">Order Details</h3>
              </div>
              
              {/* Tracking URL button added here */}
              {trackingUrl && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                  onClick={() => window.open(trackingUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Tracking URL
                </Button>
              )}
            </div>
            
            <div className="space-y-6 pl-2">
              {/* Location Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-gray-50">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Location</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-y-2 pl-6">
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <span className="text-sm text-gray-700 font-medium">{locationName}</span>
                  
                  <span className="text-sm font-medium text-gray-600">Address:</span>
                  <span className="text-sm text-gray-700">{fullAddress || "N/A"}</span>
                </div>
              </div>
              
              <Separator className="bg-gray-100" />
              
              {/* Time Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-gray-50">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Time Details</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-y-2 pl-6">
                  <span className="text-sm font-medium text-gray-600">Start Time:</span>
                  <span className="text-sm text-gray-700">{startTime}</span>
                  
                  <span className="text-sm font-medium text-gray-600">End Time:</span>
                  <span className="text-sm text-gray-700">{endTime}</span>
                  
                  <span className="text-sm font-medium text-gray-600">LDS:</span>
                  <span className="text-sm text-gray-700">{ldsInfo}</span>
                </div>
              </div>
              
              <Separator className="bg-gray-100" />
              
              {/* Materials Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-gray-50">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Materials</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-y-2 pl-6">
                  <span className="text-sm font-medium text-gray-600">Quantity:</span>
                  <span className="text-sm text-gray-700">{materialQuantity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
