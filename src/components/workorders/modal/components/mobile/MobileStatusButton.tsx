import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StatusMenuItems } from "../../../dropdown/StatusMenuItems";
import { useQueryClient } from "@tanstack/react-query";

interface MobileStatusButtonProps {
  workOrderId: string;
  currentStatus: string;
  statusUser?: string;
  statusTimestamp?: string;
  onStatusUpdate?: (workOrderId: string, newStatus: string, options?: any) => void;
}

export const MobileStatusButton = ({
  workOrderId,
  currentStatus,
  statusUser,
  statusTimestamp,
  onStatusUpdate
}: MobileStatusButtonProps) => {
  const queryClient = useQueryClient();
  
  // Helper function to get status-based styling
  const getStatusStyling = () => {
    switch (currentStatus) {
      case "approved":
        return { 
          borderColor: "border-green-300",
          bgColor: "bg-green-50",
          textColor: "text-green-700"
        };
      case "pending_review":
        return { 
          borderColor: "border-yellow-300",
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-700"
        };
      case "flagged":
      case "flagged_followup":
        return { 
          borderColor: "border-red-300",
          bgColor: "bg-red-50",
          textColor: "text-red-700" 
        };
      case "resolved":
        return { 
          borderColor: "border-blue-300",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700"
        };
      case "rejected":
        return { 
          borderColor: "border-orange-300",
          bgColor: "bg-orange-50",
          textColor: "text-orange-700"
        };
      default:
        return { 
          borderColor: "border-gray-300",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700"
        };
    }
  };

  // Get status-based styling
  const { borderColor, bgColor, textColor } = getStatusStyling();

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
          variant="outline" 
          size="sm" 
          className={`gap-1 px-2 py-1 h-7 rounded-md border ${borderColor} ${bgColor} ${textColor}`}
        >
          <span className="text-xs font-medium">Status</span>
          <ChevronDown className={`h-3.5 w-3.5 ${textColor}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        onClick={handleDropdownClick} 
        className="bg-white dark:bg-gray-900 border shadow-md z-50"
      >
        <StatusMenuItems 
          currentStatus={currentStatus}
          onStatusChange={(newStatus) => handleStatusChange(newStatus)}
          statusUser={statusUser}
          statusTimestamp={statusTimestamp}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
