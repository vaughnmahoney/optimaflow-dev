
import { Button } from "@/components/ui/button";
import { Check, Download, Flag } from "lucide-react";

interface ModalFooterProps {
  workOrderId: string;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onDownloadAll?: () => void;
  hasImages: boolean;
}

export const ModalFooter = ({
  workOrderId,
  onStatusUpdate,
  onDownloadAll,
  hasImages
}: ModalFooterProps) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-950 border-t flex justify-between items-center">
      <div className="flex gap-3">
        {onStatusUpdate && (
          <>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition-colors shadow-sm"
              onClick={() => onStatusUpdate(workOrderId, "approved")}
            >
              <Check className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button 
              className="bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-md transition-colors shadow-sm"
              onClick={() => onStatusUpdate(workOrderId, "flagged")}
            >
              <Flag className="mr-1 h-4 w-4" />
              Flag for Review
            </Button>
          </>
        )}
      </div>
      <div>
        {onDownloadAll && hasImages && (
          <Button 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-md transition-colors shadow-sm"
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
