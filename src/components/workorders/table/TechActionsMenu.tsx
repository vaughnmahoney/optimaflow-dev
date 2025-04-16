
import React from "react";
import { MoreHorizontal, Eye, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TechActionsMenuProps {
  workOrderId: string;
  onImageView: (workOrderId: string) => void;
  onAddNotes: (workOrderId: string) => void;
}

export const TechActionsMenu = ({
  workOrderId,
  onImageView,
  onAddNotes,
}: TechActionsMenuProps) => {
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
          onClick={() => onImageView(workOrderId)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Images
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAddNotes(workOrderId)}
        >
          <FileText className="mr-2 h-4 w-4" />
          Add/Edit Notes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
