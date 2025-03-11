
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
        {/* Show approve option for non-approved states */}
        {!isApproved && (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "approved")}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </DropdownMenuItem>
        )}
        
        {/* Show flag option for non-flagged, non-resolved states */}
        {!isFlagged && !isResolved && (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "flagged")}
          >
            <Flag className="h-4 w-4 mr-2" />
            Flag for Review
          </DropdownMenuItem>
        )}
        
        {/* Show resolve option for flagged states */}
        {isFlagged && !isResolved && (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "resolved")}
            className="text-purple-600"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark as Resolved
          </DropdownMenuItem>
        )}
        
        {/* Show return to pending option for resolved or approved states */}
        {(isResolved || isApproved) && (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "pending_review")}
          >
            <Clock className="h-4 w-4 mr-2" />
            Return to Pending
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
