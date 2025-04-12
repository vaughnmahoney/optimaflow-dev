
import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface ActionsMenuProps {
  workOrderId: string;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onDelete: (workOrderId: string) => void;
}

export const ActionsMenu = ({
  workOrderId,
  onStatusUpdate,
  onDelete,
}: ActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onStatusUpdate(workOrderId, "approved")}
        >
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusUpdate(workOrderId, "flagged")}
        >
          Flag
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(workOrderId)}
          className="text-red-600"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
