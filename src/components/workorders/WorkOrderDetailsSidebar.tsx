
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

  const formatDate = (date: string | null) => {
    if (!date) return 'Not available';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="w-[300px] border-r bg-muted/20">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Work Order Details</h3>
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

          <div>
            <label className="text-sm font-medium text-muted-foreground">Customer</label>
            <p className="mt-1">{workOrder.customer?.name || 'Not available'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Technician</label>
            <p className="mt-1">{workOrder.technician?.name || 'System Import'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Service Notes</label>
            <p className="mt-1 text-sm">{workOrder.service_notes || workOrder.description || 'No notes available'}</p>
          </div>

          {workOrder.completion_data && (
            <>
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3">Completion Details</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Service Date</p>
                      <p>{formatDate(workOrder.service_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Time on Site</p>
                      <p>{workOrder.completion_data.timeOnSite || 'Not available'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="capitalize">{workOrder.completion_data.status?.toLowerCase() || 'Pending'}</p>
                    </div>
                  </div>

                  {workOrder.completion_data.notes && (
                    <div className="pt-2">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Completion Notes</p>
                      <p className="text-sm">{workOrder.completion_data.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

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
