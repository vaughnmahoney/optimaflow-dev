
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
    <div className="p-3 bg-white dark:bg-gray-950 border-t flex justify-between items-center">
      <div className="flex gap-2">
        {onStatusUpdate && (
          <>
            <Button 
              variant="outline" 
              className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
              onClick={() => onStatusUpdate(workOrderId, "approved")}
            >
              <Check className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button 
              variant="outline"
              className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 hover:text-amber-800"
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
          <Button variant="outline" onClick={onDownloadAll}>
            <Download className="mr-1 h-4 w-4" />
            Download All
          </Button>
        )}
      </div>
    </div>
  );
};
