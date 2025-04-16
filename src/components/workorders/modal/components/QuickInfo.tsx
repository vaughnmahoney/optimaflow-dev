
import { Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { WorkOrder } from "../../types";

interface QuickInfoProps {
  workOrder: WorkOrder;
}

export const QuickInfo = ({ 
  workOrder 
}: QuickInfoProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
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
    <div className="p-4 space-y-4 bg-white dark:bg-gray-950">
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <div className="flex-1">
          <h3 className="font-medium">{locationName}</h3>
          <p className="text-sm text-muted-foreground">{address}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>Start Time</span>
          </div>
          <div>
            <p className="font-medium">{formatDisplayTime(startDate)}</p>
            <p className="text-xs text-muted-foreground">{formatDisplayDate(startDate)}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>End Time</span>
          </div>
          <div>
            <p className="font-medium">{formatDisplayTime(endDate)}</p>
            <p className="text-xs text-muted-foreground">{formatDisplayDate(endDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
