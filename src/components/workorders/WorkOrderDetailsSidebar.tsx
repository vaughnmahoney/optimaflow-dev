
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Flag, CheckCircle, Download, X } from "lucide-react";

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
                getStatusColor(workOrder.qc_status)
              )}
            >
              {workOrder.qc_status?.toUpperCase().replace(/_/g, ' ')}
            </Badge>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Customer</label>
            <p className="mt-1">{workOrder.customer_name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Technician</label>
            <p className="mt-1">{workOrder.technicians?.name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Service Notes</label>
            <p className="mt-1 text-sm">{workOrder.service_notes || 'No notes available'}</p>
          </div>

          <div className="pt-4 space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => onStatusUpdate('approved')}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-success" />
              Mark as Approved
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onStatusUpdate('flagged')}
            >
              <Flag className="mr-2 h-4 w-4 text-danger" />
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
