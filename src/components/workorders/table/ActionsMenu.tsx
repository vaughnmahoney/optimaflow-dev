
import { CheckCircle, Flag, Trash2, MoreVertical, CheckCheck, RefreshCw } from "lucide-react";
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
  const isApproved = workOrder.status === 'approved';
  const isResolved = workOrder.status === 'resolved';
  const isFlagged = workOrder.status === 'flagged' || workOrder.status === 'flagged_followup';
  const isPending = workOrder.status === 'pending_review';

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
        {/* Show conditionally based on current status */}
        {isApproved ? (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "pending_review")}
            className="text-gray-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Return to Pending
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "approved")}
            className={isApproved ? 'text-green-600 font-medium' : ''}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </DropdownMenuItem>
        )}
        
        {/* Flag or return to pending */}
        {isFlagged ? (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "pending_review")}
            className="text-gray-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Return to Pending
          </DropdownMenuItem>
        ) : !isResolved && (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "flagged")}
            className={isFlagged ? 'text-red-600 font-medium' : ''}
          >
            <Flag className="h-4 w-4 mr-2" />
            Flag for Review
          </DropdownMenuItem>
        )}
        
        {/* Mark as resolved or back to flagged */}
        {isFlagged && (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "resolved")}
            className="text-purple-600"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark as Resolved
          </DropdownMenuItem>
        )}
        
        {isResolved && (
          <DropdownMenuItem 
            onClick={() => onStatusUpdate(workOrder.id, "flagged")}
            className="text-red-600"
          >
            <Flag className="h-4 w-4 mr-2" />
            Return to Flagged
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
