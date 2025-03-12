
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../types";
import { formatDate, calculateDuration } from "../utils/modalUtils";
import { User, MapPin, Calendar, Clock, Hash, CalendarClock } from "lucide-react";

interface OrderDetailsTabProps {
  workOrder: WorkOrder;
}

export const OrderDetailsTab = ({ workOrder }: OrderDetailsTabProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
  const driverName = workOrder.driver?.name || workOrder.search_response?.scheduleInformation?.driverName || 'Not assigned';
  const startTime = completionData?.startTime?.localTime || '';
  const endTime = completionData?.endTime?.localTime || '';

  return (
    <div className="space-y-4">
      {/* Driver & Location Section */}
      <Card className="p-4 bg-white border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Technician & Location</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{driverName}</p>
              <p className="text-xs text-gray-500">Technician</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{workOrder.location?.name || workOrder.location?.locationName || 'N/A'}</p>
              <p className="text-xs text-gray-500">{workOrder.location?.address || 'Address not available'}</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Time Information Section */}
      <Card className="p-4 bg-white border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Time Information</h3>
        
        {/* Add LDS as the first item in Time Information */}
        <div className="mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <CalendarClock className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{workOrder.lds || 'N/A'}</p>
              <p className="text-xs text-gray-500">Last Date of Service</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{formatDate(startTime) || 'N/A'}</p>
              <p className="text-xs text-gray-500">Start Date</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{formatDate(startTime, "h:mm a") || 'N/A'}</p>
              <p className="text-xs text-gray-500">Start Time</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{formatDate(endTime) || 'N/A'}</p>
              <p className="text-xs text-gray-500">End Date</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{formatDate(endTime, "h:mm a") || 'N/A'}</p>
              <p className="text-xs text-gray-500">End Time</p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{workOrder.duration || calculateDuration(startTime, endTime) || 'N/A'}</p>
              <p className="text-xs text-gray-500">Total Duration</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Order Number Information */}
      <Card className="p-4 bg-white border border-gray-200">
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Hash className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{workOrder.order_no || 'N/A'}</p>
              <p className="text-xs text-gray-500">Order Number</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
