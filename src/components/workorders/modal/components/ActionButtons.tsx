
import { Button } from "@/components/ui/button";
import { CheckCircle, Flag, Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionButtonsProps {
  workOrderId: string;
  hasImages: boolean;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onDownloadAll?: () => void;
}

export const ActionButtons = ({
  workOrderId,
  hasImages,
  onStatusUpdate,
  onDownloadAll,
}: ActionButtonsProps) => {
  return (
    <div className="p-6 border-t bg-background space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              className="w-full justify-start"
              variant="outline"
              onClick={() => onStatusUpdate?.(workOrderId, 'approved')}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Mark as Approved
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Shortcut: Ctrl/⌘ + A</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              className="w-full justify-start"
              variant="outline"
              onClick={() => onStatusUpdate?.(workOrderId, 'flagged')}
            >
              <Flag className="mr-2 h-4 w-4 text-red-600" />
              Flag for Review
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Shortcut: Ctrl/⌘ + F</p>
          </TooltipContent>
        </Tooltip>
        
        <Button 
          className="w-full justify-start"
          variant="outline"
          onClick={onDownloadAll}
          disabled={!hasImages}
        >
          <Download className="mr-2 h-4 w-4" />
          Download All Images
        </Button>
      </TooltipProvider>
    </div>
  );
};
