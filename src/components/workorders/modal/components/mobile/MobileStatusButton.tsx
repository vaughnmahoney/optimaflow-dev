
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StatusMenuItems } from "../../../dropdown/StatusMenuItems";

interface MobileStatusButtonProps {
  workOrderId: string;
  currentStatus: string;
  onStatusUpdate?: (workOrderId: string, newStatus: string) => void;
}

export const MobileStatusButton = ({
  workOrderId,
  currentStatus,
  onStatusUpdate
}: MobileStatusButtonProps) => {
  const handleStatusChange = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(workOrderId, newStatus);
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
          className="h-9 px-3 py-1 text-xs flex items-center justify-center gap-1 border-gray-300 text-gray-600"
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
