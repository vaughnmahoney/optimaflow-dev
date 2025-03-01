
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkOrder } from "../../types";
import { formatDate, calculateDuration } from "../utils/modalUtils";

interface OrderDetailsTabProps {
  workOrder: WorkOrder;
}

export const OrderDetailsTab = ({ workOrder }: OrderDetailsTabProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
  const driverName = workOrder.driver?.name || workOrder.search_response?.scheduleInformation?.driverName || 'Not assigned';
  const startTime = completionData?.startTime?.localTime || '';
  const endTime = completionData?.endTime?.localTime || '';

  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <Card className="p-4">
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Driver: </span>
              {driverName}
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
              {formatDate(startTime)}
            </p>
            <p>
              <span className="text-muted-foreground">Start Time: </span>
              {formatDate(startTime, "h:mm a")}
            </p>
            <p>
              <span className="text-muted-foreground">End Date: </span>
              {formatDate(endTime)}
            </p>
            <p>
              <span className="text-muted-foreground">End Time: </span>
              {formatDate(endTime, "h:mm a")}
            </p>
            <p>
              <span className="text-muted-foreground">Duration: </span>
              {workOrder.duration || calculateDuration(startTime, endTime)}
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
