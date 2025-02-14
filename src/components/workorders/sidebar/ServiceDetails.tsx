
import { Calendar, Clock, Truck, User } from "lucide-react";
import { format } from "date-fns";
import { ServiceDetailsProps } from "../types/sidebar";

export const ServiceDetails = ({ workOrder }: ServiceDetailsProps) => {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "EEEE, MMMM d, yyyy");
    } catch {
      return 'Not available';
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Not available';
    }
  };

  const calculateTimeOnSite = (start: Date, end: Date): string => {
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getTimeOnSite = () => {
    if (workOrder.completion_data?.data?.startTime?.localTime && 
        workOrder.completion_data?.data?.endTime?.localTime) {
      return calculateTimeOnSite(
        new Date(workOrder.completion_data.data.startTime.localTime),
        new Date(workOrder.completion_data.data.endTime.localTime)
      );
    }
    return workOrder.completion_response?.timeOnSite || 'Not available';
  };

  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-2">Service Details</h4>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Service Date</p>
            <p className="text-sm">{formatDate(workOrder.service_date || workOrder.lastServiceDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Driver</p>
            <p className="text-sm">
              {workOrder.driver?.name || 
               workOrder.driverName || 
               workOrder.completion_data?.data?.assignedTo?.name || 
               'Not assigned'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Completion Time</p>
            <p className="text-sm">
              {workOrder.completion_data?.data?.endTime?.localTime ? 
                formatTime(workOrder.completion_data.data.endTime.localTime) :
                workOrder.completion_response?.proofOfDelivery?.timestamp ?
                  formatTime(workOrder.completion_response.proofOfDelivery.timestamp) :
                  'Not available'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Time on Site</p>
            <p className="text-sm">{getTimeOnSite()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-sm capitalize">
              {workOrder.completion_data?.data?.status?.toLowerCase() || 
               workOrder.status?.toLowerCase() || 
               'Pending'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
