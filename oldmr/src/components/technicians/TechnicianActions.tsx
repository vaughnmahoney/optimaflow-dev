import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import type { Technician } from "@/types/attendance";

interface TechnicianActionsProps {
  tech: Technician;
  isEditing: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  onEdit: (tech: Technician) => void;
  onUpdate: (tech: Technician) => void;
  onRemove: (id: string) => void;
  onCancel: () => void;
  editingTechnician: Technician | null;
}

export const TechnicianActions = ({
  tech,
  isEditing,
  isUpdating,
  isRemoving,
  onEdit,
  onUpdate,
  onRemove,
  onCancel,
  editingTechnician,
}: TechnicianActionsProps) => {
  return (
    <div className="flex items-center">
      {isEditing ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdate(editingTechnician!)}
            disabled={isUpdating}
          >
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop view buttons */}
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(tech)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(tech.id)}
              disabled={isRemoving}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </Button>
          </div>
          
          {/* Mobile view dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onEdit(tech)}
                  className="cursor-pointer"
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onRemove(tech.id)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  disabled={isRemoving}
                >
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  );
};