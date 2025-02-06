import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import type { Technician } from "@/types/attendance";
import { GroupSelector } from "@/components/groups/GroupSelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TechnicianTableRowProps {
  tech: Technician;
  isEditing: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  onEdit: (tech: Technician) => void;
  onUpdate: (tech: Technician) => void;
  onRemove: (id: string) => void;
  onCancel: () => void;
  editingTechnician: Technician | null;
  setEditingTechnician: (tech: Technician | null) => void;
}

export const TechnicianTableRow = ({
  tech,
  isEditing,
  isUpdating,
  isRemoving,
  onEdit,
  onUpdate,
  onRemove,
  onCancel,
  editingTechnician,
  setEditingTechnician,
}: TechnicianTableRowProps) => {
  const handleGroupChange = (groupId: string) => {
    if (editingTechnician) {
      setEditingTechnician({
        ...editingTechnician,
        group_id: groupId
      });
    }
  };

  // Fetch group details
  const { data: group } = useQuery({
    queryKey: ['group', tech.group_id],
    queryFn: async () => {
      if (!tech.group_id) return null;
      const { data } = await supabase
        .from('groups')
        .select('name')
        .eq('id', tech.group_id)
        .single();
      return data;
    },
    enabled: !!tech.group_id,
  });

  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        {isEditing ? (
          <Input
            value={editingTechnician?.name || ""}
            onChange={(e) =>
              setEditingTechnician(editingTechnician ? {
                ...editingTechnician,
                name: e.target.value,
              } : null)
            }
            className="w-full"
          />
        ) : (
          tech.name
        )}
      </td>
      <td className="py-3 px-4">
        {isEditing ? (
          <Input
            type="email"
            value={editingTechnician?.email || ""}
            onChange={(e) =>
              setEditingTechnician(editingTechnician ? {
                ...editingTechnician,
                email: e.target.value,
              } : null)
            }
            className="w-full"
          />
        ) : (
          tech.email
        )}
      </td>
      <td className="py-3 px-4">
        {isEditing ? (
          <Input
            type="tel"
            value={editingTechnician?.phone || ""}
            onChange={(e) =>
              setEditingTechnician(editingTechnician ? {
                ...editingTechnician,
                phone: e.target.value,
              } : null)
            }
            className="w-full"
          />
        ) : (
          tech.phone
        )}
      </td>
      <td className="py-3 px-4">
        <div className="w-[200px]">
          {isEditing ? (
            <GroupSelector
              selectedGroupId={editingTechnician?.group_id || undefined}
              onGroupSelect={handleGroupChange}
            />
          ) : (
            <span className="text-gray-700">
              {group?.name || 'No group assigned'}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
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
          <div className="flex items-center">
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
          </div>
        )}
      </td>
    </tr>
  );
};