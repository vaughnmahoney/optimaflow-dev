
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StatusMenuItems } from "../../../dropdown/StatusMenuItems";
import { useQueryClient } from "@tanstack/react-query";
import { getStatusBorderColor, getStatusBgColor } from "../../utils/modalUtils";

interface MobileStatusButtonProps {
  workOrderId: string;
  currentStatus: string;
  onStatusUpdate?: (workOrderId: string, newStatus: string, options?: any) => void;
}

export const MobileStatusButton = ({
  workOrderId,
  currentStatus,
  onStatusUpdate
}: MobileStatusButtonProps) => {
  const queryClient = useQueryClient();
  
  // Get status-based styling
  const borderColorClass = getStatusBorderColor(currentStatus);
  const bgColorClass = getStatusBgColor(currentStatus);

  const handleStatusChange = (newStatus: string) => {
    if (onStatusUpdate) {
      // Pass skipRefresh: true to prevent automatic filtering
      // And updateLocal: true to update the UI status immediately
      onStatusUpdate(workOrderId, newStatus, { skipRefresh: true, updateLocal: true });
      
      // Keep the badge count updated separately for sidebar accuracy
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    // Prevent event from bubbling up to parent elements
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
        <Button 
          variant="ghost"
          size="sm"
          className={`h-8 px-3 text-xs flex items-center justify-center gap-1 text-gray-600 hover:bg-gray-100 border ${borderColorClass} ${bgColorClass}`}
        >
          Status
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        onClick={handleDropdownClick} 
        className="bg-white dark:bg-gray-900 border shadow-md z-50"
      >
        <StatusMenuItems 
          currentStatus={currentStatus}
          onStatusChange={(newStatus) => handleStatusChange(newStatus)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
