
import { User, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { WorkOrder } from "../../types";

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
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDisplayTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), "h:mm a");
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-950 space-y-3">
      {/* Driver info */}
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">{driverName}</p>
        </div>
      </div>
      
      {/* Location info */}
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">{locationName}</p>
          <p className="text-xs text-gray-500">{address}</p>
        </div>
      </div>
      
      {/* Time info */}
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
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
