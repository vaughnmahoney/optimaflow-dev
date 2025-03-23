
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { WorkOrder } from "../types";

interface OrderDetailsTabProps {
  workOrder: WorkOrder;
}

export const OrderDetailsTab = ({ workOrder }: OrderDetailsTabProps) => {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "EEEE, MMMM d, yyyy");
    } catch {
      return 'Not available';
    }
  };

  const formatTime = (date: string) => {
    try {
      return format(new Date(date), "h:mm a");
    } catch {
      return 'Not available';
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <Card className="p-4">
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Driver: </span>
              {workOrder.driver?.name || 'Not assigned'}
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
              <span className="text-muted-foreground">Date: </span>
              {formatDate(workOrder.service_date || '')}
            </p>
            <p>
              <span className="text-muted-foreground">Time: </span>
              {formatTime(workOrder.service_date || '')}
            </p>
            <p>
              <span className="text-muted-foreground">Duration: </span>
              {workOrder.duration || 'N/A'}
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
