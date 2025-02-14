
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Flag, CheckCircle, Download, X, Clock, Calendar, Truck } from "lucide-react";

interface WorkOrderDetailsSidebarProps {
  workOrder: any;
  onClose: () => void;
  onStatusUpdate: (status: string) => void;
  onDownloadAll: () => void;
}

export const WorkOrderDetailsSidebar = ({
  workOrder,
  onClose,
  onStatusUpdate,
  onDownloadAll
}: WorkOrderDetailsSidebarProps) => {
  if (!workOrder) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground hover:bg-success/90';
      case 'flagged':
        return 'bg-danger text-danger-foreground hover:bg-danger/90';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  const calculateTimeOnSite = (startTime: string, endTime: string): string => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diff = end.getTime() - start.getTime();
      const minutes = Math.floor(diff / 1000 / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    } catch {
      return 'Not available';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not available';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatCompletionTime = (time: string | null) => {
    if (!time) return null;
    try {
      return new Date(time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return null;
    }
  };

  const getLocationDetails = () => {
    if (!workOrder.location) return { name: 'Not available', address: 'Not available' };
    
    return {
      name: workOrder.location.locationName || 'Not available',
      address: workOrder.location.address || 'Not available'
    };
  };

  const location = getLocationDetails();
  const completionData = workOrder.completion_data?.data || {};
  const timeOnSite = completionData.startTime && completionData.endTime
    ? calculateTimeOnSite(completionData.startTime.localTime, completionData.endTime.localTime)
    : null;

  return (
    <div className="w-[300px] border-r bg-muted/20">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Work Order #{workOrder.order_id || workOrder.optimoroute_order_number}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Badge 
              className={cn(
                "mt-1.5 w-full justify-center",
                getStatusColor(workOrder.qc_status || 'pending_review')
              )}
            >
              {(workOrder.qc_status || 'PENDING REVIEW').toUpperCase().replace(/_/g, ' ')}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Location Details</h4>
              <div className="space-y-1">
                <p className="text-sm"><span className="font-medium">Name:</span> {location.name}</p>
                <p className="text-sm"><span className="font-medium">Address:</span> {location.address}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Service Details</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Service Date</p>
                    <p>{formatDate(workOrder.service_date)}</p>
                  </div>
                </div>

                {timeOnSite && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Time on Site</p>
                      <p>{timeOnSite}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="capitalize">
                      {completionData.status?.toLowerCase() || 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {(workOrder.service_notes || workOrder.description || completionData.form?.note) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
                <p className="text-sm">
                  {workOrder.service_notes || workOrder.description || completionData.form?.note}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => onStatusUpdate('approved')}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Mark as Approved
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onStatusUpdate('flagged')}
            >
              <Flag className="mr-2 h-4 w-4 text-red-600" />
              Flag for Review
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={onDownloadAll}
            >
              <Download className="mr-2 h-4 w-4" />
              Download All Images
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
