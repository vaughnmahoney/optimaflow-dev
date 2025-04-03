import { Button } from "@/components/ui/button";
import { CheckCircle, Flag, Download, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface ActionButtonsProps {
  workOrderId: string;
  hasImages: boolean;
  currentStatus: string;
  onStatusUpdate?: (workOrderId: string, status: string, options?: any) => void;
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
      
      // Pass skipRefresh: true to prevent automatic filtering
      // But also include updateLocal: true to update the UI status
      await onStatusUpdate?.(workOrderId, status, { skipRefresh: true, updateLocal: true });
      
      // Update badge count separately to keep the sidebar accurate
      // This won't affect the current filtered list
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
    } catch (error) {
      console.error('Error updating status:', error);
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
              variant="ghost"
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
              variant="ghost"
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
          variant="ghost"
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
