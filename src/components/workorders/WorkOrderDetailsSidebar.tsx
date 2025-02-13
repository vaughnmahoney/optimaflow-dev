
import { DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, Flag, Download } from "lucide-react";
import { format } from "date-fns";

interface WorkOrderDetailsProps {
  workOrder: any;
  onClose: () => void;
  onStatusUpdate: (status: string) => void;
  onDownloadAll: () => void;
}

interface WorkOrderLocation {
  store_name: string;
  address: string;
}

export const WorkOrderDetailsSidebar = ({
  workOrder,
  onClose,
  onStatusUpdate,
  onDownloadAll,
}: WorkOrderDetailsProps) => {
  const location = workOrder?.location as unknown as WorkOrderLocation;

  return (
    <div className="w-80 border-r bg-gray-50/50 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <DialogTitle>Service Details</DialogTitle>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Order ID</label>
          <p className="text-sm">{workOrder?.external_id || 'N/A'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Service Date</label>
          <p className="text-sm">
            {workOrder?.service_date 
              ? format(new Date(workOrder.service_date), "PPP")
              : 'N/A'}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Technician</label>
          <p className="text-sm">{workOrder?.technicians?.name || 'N/A'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Location</label>
          <p className="text-sm whitespace-pre-wrap">
            {location 
              ? `${location.store_name}\n${location.address}`
              : 'N/A'}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <div className="mt-1">
            <Badge 
              variant={
                workOrder?.qc_status === 'approved' 
                  ? 'success' 
                  : workOrder?.qc_status === 'flagged' 
                  ? 'destructive' 
                  : 'warning'
              }
            >
              {workOrder?.qc_status?.toUpperCase() || 'PENDING'}
            </Badge>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Service Notes</label>
          <p className="text-sm whitespace-pre-wrap">{workOrder?.notes || 'No notes'}</p>
        </div>

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-green-500 hover:bg-green-600"
            onClick={() => onStatusUpdate('approved')}
            disabled={workOrder?.qc_status === 'approved'}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button 
            variant="destructive"
            className="flex-1"
            onClick={() => onStatusUpdate('flagged')}
            disabled={workOrder?.qc_status === 'flagged'}
          >
            <Flag className="mr-2 h-4 w-4" />
            Flag
          </Button>
        </div>

        <Button 
          className="w-full"
          onClick={onDownloadAll}
        >
          <Download className="mr-2 h-4 w-4" />
          Download All Photos
        </Button>
      </div>
    </div>
  );
};
