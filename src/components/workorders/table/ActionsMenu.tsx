
import { CheckCircle, Flag, Trash2, MoreVertical, CheckCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ActionsMenuProps {
  workOrder: WorkOrder;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onDelete: (workOrderId: string) => void;
}

export const ActionsMenu = ({ workOrder, onStatusUpdate, onDelete }: ActionsMenuProps) => {
  const isResolved = workOrder.status === 'resolved';
  const isFlagged = workOrder.status === 'flagged' || workOrder.status === 'flagged_followup';
  const isApproved = workOrder.status === 'approved';
  const isPending = workOrder.status === 'pending_review';

  // Get status-specific styling for the disabled status menu item
  const getStatusItemStyle = () => {
    if (isApproved) return "text-green-700 bg-green-50 hover:bg-green-100";
    if (isFlagged) return "text-red-700 bg-red-50 hover:bg-red-100";
    if (isResolved) return "text-purple-700 bg-purple-50 hover:bg-purple-100";
    return "text-gray-500 hover:bg-gray-100";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 hover:bg-slate-100"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Current status - clicking returns to pending */}
        {!isPending && (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "pending_review")}
            className={getStatusItemStyle()}
          >
            <Clock className="h-4 w-4 mr-2" />
            {isApproved ? "Approved" : isFlagged ? "Flagged" : isResolved ? "Resolved" : "Status"}
          </DropdownMenuItem>
        )}
        
        {/* Show approve option if not already approved */}
        {!isApproved && (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "approved")}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </DropdownMenuItem>
        )}
        
        {/* Show flag option if not already flagged */}
        {!isFlagged && (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "flagged")}
          >
            <Flag className="h-4 w-4 mr-2" />
            Flag
          </DropdownMenuItem>
        )}
        
        {/* Show resolve option for flagged states */}
        {isFlagged && (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "resolved")}
            className="text-purple-600"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Resolve
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onDelete(workOrder.id)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
