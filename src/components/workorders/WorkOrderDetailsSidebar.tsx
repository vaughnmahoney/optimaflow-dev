
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Flag, CheckCircle, Download, X, Calendar, Truck, User, Clock } from "lucide-react";
import { format } from "date-fns";

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

  const getNotes = () => {
    const notes = [];
    
    if (workOrder.serviceNotes) {
      notes.push(workOrder.serviceNotes);
    }
    if (workOrder.completion_response?.notes) {
      notes.push(workOrder.completion_response.notes);
    }
    if (workOrder.completion_response?.proofOfDelivery?.notes) {
      notes.push(workOrder.completion_response.proofOfDelivery.notes);
    }
    
    return notes.filter(Boolean).join('\n\n');
  };

  return (
    <div className="w-[300px] border-r bg-background">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Work Order #{workOrder.order_no}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Status</h4>
            <Badge 
              className={cn(
                "w-full justify-center py-1",
                getStatusColor(workOrder.qc_status || 'pending_review')
              )}
            >
              {(workOrder.qc_status || 'PENDING REVIEW').toUpperCase().replace(/_/g, ' ')}
            </Badge>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Location Details</h4>
            <div className="space-y-1">
              <div>
                <span className="text-sm">Name: </span>
                <span className="text-sm">{typeof workOrder.location === 'object' ? workOrder.location?.name : workOrder.location || 'Not available'}</span>
              </div>
              <div>
                <span className="text-sm">Address: </span>
                <span className="text-sm">{typeof workOrder.location === 'object' ? workOrder.location?.address : workOrder.address || 'Not available'}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Service Details</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Service Date</p>
                  <p className="text-sm">{formatDate(workOrder.lastServiceDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Driver</p>
                  <p className="text-sm">{workOrder.driverName || 'Not assigned'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Completion Time</p>
                  <p className="text-sm">
                    {workOrder.completion_response?.proofOfDelivery?.timestamp ? 
                      formatTime(workOrder.completion_response.proofOfDelivery.timestamp) : 
                      'Not available'}
                  </p>
                </div>
              </div>

              {workOrder.completion_response?.timeOnSite && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time on Site</p>
                    <p className="text-sm">{workOrder.completion_response.timeOnSite}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-sm capitalize">
                    {workOrder.status?.toLowerCase() || 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {getNotes() && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
              <p className="text-sm whitespace-pre-wrap">{getNotes()}</p>
            </div>
          )}

          <div className="space-y-2">
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
