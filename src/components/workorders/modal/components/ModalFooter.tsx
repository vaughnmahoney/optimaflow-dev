
import { Button } from "@/components/ui/button";
import { Check, Download, Flag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { QcNotesSheet } from "./QcNotesSheet";
import { WorkOrder } from "../../types";

interface ModalFooterProps {
  workOrderId: string;
  workOrder: WorkOrder;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onDownloadAll?: () => void;
  hasImages: boolean;
}

export const ModalFooter = ({
  workOrderId,
  workOrder,
  onStatusUpdate,
  onDownloadAll,
  hasImages
}: ModalFooterProps) => {
  return (
    <div className="p-3 bg-white dark:bg-gray-950 border-t flex justify-between items-center">
      <div className="flex gap-2">
        {onStatusUpdate && (
          <>
            <Button 
              variant="custom"
              className="bg-[#6CAE75] hover:bg-[#5a9361] text-white font-medium rounded-md transition-colors"
              onClick={() => onStatusUpdate(workOrderId, "approved")}
            >
              <Check className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button 
              variant="custom"
              className="bg-[#ea384c] hover:bg-[#d32f3f] text-white font-medium rounded-md transition-colors"
              onClick={() => onStatusUpdate(workOrderId, "flagged")}
            >
              <Flag className="mr-1 h-4 w-4" />
              Flag for Review
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <QcNotesSheet workOrder={workOrder} />
        {onDownloadAll && hasImages && (
          <Button 
            variant="outline"
            className="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 font-medium rounded-md transition-colors"
            onClick={onDownloadAll}
          >
            <Download className="mr-1 h-4 w-4" />
            Download All
          </Button>
        )}
      </div>
    </div>
  );
};
