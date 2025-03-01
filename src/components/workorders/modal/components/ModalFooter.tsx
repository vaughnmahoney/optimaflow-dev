
import { Button } from "@/components/ui/button";
import { Check, Download, Flag } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
              variant="custom"
              className="bg-[#6CAE75]/90 hover:bg-[#6CAE75] text-white font-medium rounded-md transition-colors shadow-sm"
              onClick={() => onStatusUpdate(workOrderId, "approved")}
            >
              <Check className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button 
              variant="custom"
              className="bg-[#ea384c]/90 hover:bg-[#ea384c] text-white font-medium rounded-md transition-colors shadow-sm"
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
            variant="outline"
            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-700 font-medium rounded-md transition-colors"
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
