
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link as LinkIcon } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { WorkOrder } from "../../types";

interface OrderDetailsTabProps {
  workOrder: WorkOrder;
}

export const OrderDetailsTab = ({ workOrder }: OrderDetailsTabProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
  const trackingUrl = completionData?.tracking_url;

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

  const calculateDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return "N/A";
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const durationInMinutes = differenceInMinutes(end, start);
      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;
      return `${hours}h ${minutes}m`;
    } catch {
      return "N/A";
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <Card className="p-4">
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Driver: </span>
              {workOrder.driver || 'Not assigned'}
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
              {formatDate(completionData?.startTime || '')}
            </p>
            <p>
              <span className="text-muted-foreground">Start Time: </span>
              {formatTime(completionData?.startTime || '')}
            </p>
            <p>
              <span className="text-muted-foreground">End Date: </span>
              {formatDate(completionData?.endTime || '')}
            </p>
            <p>
              <span className="text-muted-foreground">End Time: </span>
              {formatTime(completionData?.endTime || '')}
            </p>
            <p>
              <span className="text-muted-foreground">Duration: </span>
              {calculateDuration(
                completionData?.startTime,
                completionData?.endTime
              )}
            </p>
            <p>
              <span className="text-muted-foreground">LDS: </span>
              {workOrder.lds || 'N/A'}
            </p>
            {trackingUrl && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full text-left flex items-center gap-2"
                  onClick={() => window.open(trackingUrl, '_blank')}
                >
                  <LinkIcon className="h-4 w-4" />
                  View Tracking URL
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </ScrollArea>
  );
};
