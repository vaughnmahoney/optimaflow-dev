
import { Button } from "@/components/ui/button";
import { CheckCircle, Flag, Download, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface ActionButtonsProps {
  workOrderId: string;
  hasImages: boolean;
  currentStatus: string;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onDownloadAll?: () => void;
}

export const ActionButtons = ({
  workOrderId,
  hasImages,
  currentStatus,
  onStatusUpdate,
  onDownloadAll,
}: ActionButtonsProps) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleStatusUpdate = async (status: string) => {
    try {
      setIsUpdating(status);
      await onStatusUpdate?.(workOrderId, status);
      
      // Immediately invalidate the badge count query to update the sidebar badge
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
      
      toast.success(
        status === 'approved' 
          ? 'Work order approved successfully' 
          : 'Work order flagged for review'
      );
    } catch (error) {
      toast.error(
        status === 'approved'
          ? 'Failed to approve work order'
          : 'Failed to flag work order'
      );
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="p-6 border-t bg-background space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              className="w-full justify-start relative"
              variant="outline"
              onClick={() => handleStatusUpdate('approved')}
              disabled={isUpdating !== null || currentStatus === 'approved'}
            >
              {isUpdating === 'approved' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className={cn(
                  "mr-2 h-4 w-4",
                  currentStatus === 'approved' ? "text-green-600" : "text-muted-foreground"
                )} />
              )}
              {currentStatus === 'approved' ? 'Approved' : 'Mark as Approved'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Shortcut: Ctrl/⌘ + A</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              className="w-full justify-start relative"
              variant="outline"
              onClick={() => handleStatusUpdate('flagged')}
              disabled={isUpdating !== null || currentStatus === 'flagged'}
            >
              {isUpdating === 'flagged' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Flag className={cn(
                  "mr-2 h-4 w-4",
                  currentStatus === 'flagged' ? "text-red-600" : "text-muted-foreground"
                )} />
              )}
              {currentStatus === 'flagged' ? 'Flagged for Review' : 'Flag for Review'}
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
