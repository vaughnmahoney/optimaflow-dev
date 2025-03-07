
import { CheckCircle, Flag, Trash2, Image, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionsMenuProps {
  workOrder: WorkOrder;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void; // Add missing prop
  onDelete: (workOrderId: string) => void;
}

export const ActionsMenu = ({ workOrder, onStatusUpdate, onImageView, onDelete }: ActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => onStatusUpdate(workOrder.id, "approved")}
          className={workOrder.status === 'approved' ? 'text-green-600' : ''}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onStatusUpdate(workOrder.id, "flagged")}
          className={workOrder.status === 'flagged' ? 'text-red-600' : ''}
        >
          <Flag className="h-4 w-4 mr-2" />
          Flag for Review
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onImageView(workOrder.id)}
        >
          <Image className="h-4 w-4 mr-2" />
          View Images
        </DropdownMenuItem>
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
