
import { Calendar, Clock, Truck, User, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ServiceDetailsProps } from "../types/sidebar";

export const ServiceDetails = ({ workOrder }: ServiceDetailsProps) => {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "EEEE, MMMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error, date);
      return 'Not available';
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy h:mm a");
    } catch (error) {
      console.error("Error formatting timestamp:", error, timestamp);
      return 'Not available';
    }
  };

  const calculateTimeOnSite = (start: string, end: string): string => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diff = endDate.getTime() - startDate.getTime();
      const minutes = Math.floor(diff / 1000 / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    } catch (error) {
      console.error("Error calculating time on site:", error);
      return 'Not available';
    }
  };

  const getTimeOnSite = () => {
    if (workOrder.completion_data?.data?.startTime?.localTime && 
        workOrder.completion_data?.data?.endTime?.localTime) {
      return calculateTimeOnSite(
        workOrder.completion_data.data.startTime.localTime,
        workOrder.completion_data.data.endTime.localTime
      );
    }
    return 'Not available';
  };

  const getServiceDate = () => {
    const date = workOrder.service_date || workOrder.lastServiceDate;
    return date ? formatDate(date) : 'Not available';
  };

  const getCompletionTime = () => {
    if (workOrder.completion_data?.data?.endTime?.localTime) {
      return formatTime(workOrder.completion_data.data.endTime.localTime);
    }
    return 'Not available';
  };

  const getLocation = () => {
    if (workOrder.location?.locationName && workOrder.location?.locationNo) {
      return `${workOrder.location.locationName} (${workOrder.location.locationNo})`;
    }
    return workOrder.location?.locationName || workOrder.location?.name || 'Not available';
  };

  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-2">Service Details</h4>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Service Date</p>
            <p className="text-sm">{getServiceDate()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="text-sm">{getLocation()}</p>
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
            <p className="text-sm">{getCompletionTime()}</p>
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
              {(workOrder.completion_data?.data?.status || 
                workOrder.status || 
                'pending').toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
