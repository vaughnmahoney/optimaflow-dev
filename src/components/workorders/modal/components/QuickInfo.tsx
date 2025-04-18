
import { WorkOrder } from "../../types";
import { formatLocalTime } from "@/utils/dateUtils";

interface QuickInfoProps {
  workOrder: WorkOrder;
}

export const QuickInfo = ({ 
  workOrder 
}: QuickInfoProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
  const driverName = workOrder.driver?.name || 'No Driver Assigned';
  const locationName = workOrder.location?.name || workOrder.location?.locationName || 'Unknown Location';
  const address = workOrder.location?.address || 'No Address Available';
  const startDate = completionData?.startTime?.localTime;
  const endDate = completionData?.endTime?.localTime;
  
  const formatDisplayDate = (dateStr?: string) => {
    return formatLocalTime(dateStr, "MMM d, yyyy", 'N/A');
  };

  const formatDisplayTime = (dateStr?: string) => {
    return formatLocalTime(dateStr, "h:mm a", 'N/A');
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-950 space-y-3">
      {/* Driver info */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500">Driver</p>
        <p className="text-sm font-medium">{driverName}</p>
      </div>
      
      {/* Location info */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500">Location</p>
        <div>
          <p className="text-sm font-medium">{locationName}</p>
          <p className="text-xs text-gray-500">{address}</p>
        </div>
      </div>
      
      {/* Time info */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500">Time</p>
        <div className="grid grid-cols-2 gap-2 text-sm w-full">
          <div>
            <p className="text-xs text-gray-500">Start:</p>
            <p className="text-xs font-medium">{formatDisplayTime(startDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">End:</p>
            <p className="text-xs font-medium">{formatDisplayTime(endDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
