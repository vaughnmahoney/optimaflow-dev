
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../types";
import { Clock, MapPin, Truck, CalendarIcon, BadgeInfo } from "lucide-react";
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

  // Driver information
  const driverName = workOrder.driver?.name || "No driver assigned";

  // LDS information (using lds field if available)
  const ldsInfo = workOrder.lds || "N/A";

  return (
    <div className="space-y-4">
      {/* Location Information - Now First */}
      <Card className="overflow-hidden border-l-4 border-l-blue-400">
        <div className="bg-gradient-to-r from-blue-50 to-transparent p-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium text-blue-700">Location Information</h3>
          </div>
        </div>
        <div className="p-4 grid gap-3">
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Name:</span>
            <span className="text-sm text-gray-700">{locationName}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Address:</span>
            <span className="text-sm text-gray-700">{fullAddress || "N/A"}</span>
          </div>
        </div>
      </Card>

      {/* Time Information - Now Second */}
      <Card className="overflow-hidden border-l-4 border-l-blue-400">
        <div className="bg-gradient-to-r from-blue-50 to-transparent p-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium text-blue-700">Time Information</h3>
          </div>
        </div>
        <div className="p-4 grid gap-3">
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Start Time:</span>
            <span className="text-sm text-gray-700">{startTime}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">End Time:</span>
            <span className="text-sm text-gray-700">{endTime}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Service Date:</span>
            <span className="text-sm text-gray-700">{workOrder.service_date ? formatDate(workOrder.service_date) : "N/A"}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">LDS:</span>
            <span className="text-sm text-gray-700">{ldsInfo}</span>
          </div>
        </div>
      </Card>

      {/* Driver Information */}
      <Card className="overflow-hidden border-l-4 border-l-blue-400">
        <div className="bg-gradient-to-r from-blue-50 to-transparent p-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium text-blue-700">Driver Information</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Driver:</span>
            <span className="text-sm text-gray-700">{driverName}</span>
          </div>
        </div>
      </Card>

      {/* Order Information */}
      <Card className="overflow-hidden border-l-4 border-l-blue-400">
        <div className="bg-gradient-to-r from-blue-50 to-transparent p-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <BadgeInfo className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium text-blue-700">Order Information</h3>
          </div>
        </div>
        <div className="p-4 grid gap-3">
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Order #:</span>
            <span className="text-sm text-gray-700">{workOrder.order_no || "N/A"}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span className="text-sm text-gray-700 capitalize">{workOrder.status?.replace(/_/g, " ") || "N/A"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

