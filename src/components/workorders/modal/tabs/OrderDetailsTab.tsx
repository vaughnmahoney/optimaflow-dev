
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkOrder } from "../../types";
import { formatDate, calculateDuration } from "../utils/modalUtils";

interface OrderDetailsTabProps {
  workOrder: WorkOrder;
}

export const OrderDetailsTab = ({ workOrder }: OrderDetailsTabProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;

  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <Card className="p-4">
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Driver: </span>
              {workOrder.search_response?.scheduleInformation?.driverName || 'Not assigned'}
            </p>
            <p>
              <span className="text-muted-foreground">Location: </span>
              {workOrder.location?.name || workOrder.location?.locationName || 'N/A'}
            </p>
            <p>
              <span className="text-muted-foreground">Address: </span>
              {workOrder.location?.address || 'N/A'}
            </p>
            <p>
              <span className="text-muted-foreground">Start Date: </span>
              {formatDate(completionData?.startTime?.localTime || '')}
            </p>
            <p>
              <span className="text-muted-foreground">Start Time: </span>
              {formatDate(completionData?.startTime?.localTime || '', "h:mm a")}
            </p>
            <p>
              <span className="text-muted-foreground">End Date: </span>
              {formatDate(completionData?.endTime?.localTime || '')}
            </p>
            <p>
              <span className="text-muted-foreground">End Time: </span>
              {formatDate(completionData?.endTime?.localTime || '', "h:mm a")}
            </p>
            <p>
              <span className="text-muted-foreground">Duration: </span>
              {calculateDuration(
                completionData?.startTime?.localTime,
                completionData?.endTime?.localTime
              )}
            </p>
            <p>
              <span className="text-muted-foreground">LDS: </span>
              {workOrder.lds || 'N/A'}
            </p>
          </div>
        </Card>
      </div>
    </ScrollArea>
  );
};
