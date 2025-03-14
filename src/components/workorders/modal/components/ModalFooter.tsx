import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { WorkOrder } from "../../types";

interface ModalFooterProps {
  workOrderId: string;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onDownloadAll?: () => void;
  hasImages: boolean;
  status?: string;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
  workOrder?: WorkOrder;
}

export const ModalFooter = ({
  workOrderId,
  onStatusUpdate,
  onDownloadAll,
  hasImages,
  status,
  onResolveFlag,
  workOrder
}: ModalFooterProps) => {
  return (
    <div className="flex justify-between items-center p-4 border-t">
      <div className="space-x-2">
        {onStatusUpdate && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onStatusUpdate(workOrderId, "approved")}
            >
              Approve
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onStatusUpdate(workOrderId, "rejected")}
            >
              Reject
            </Button>
            {status === "flagged" && onResolveFlag && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onResolveFlag(workOrderId, "approved")}
                >
                  Approve Anyway
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onResolveFlag(workOrderId, "followup")}
                >
                  Request Follow-up
                </Button>
              </>
            )}
          </>
        )}
      </div>
      
      <div className="flex space-x-2">
        {onDownloadAll && hasImages && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownloadAll}
            className="flex items-center gap-1"
          >
            <DownloadIcon className="h-4 w-4" />
            Download All
          </Button>
        )}
      </div>
    </div>
  );
};
