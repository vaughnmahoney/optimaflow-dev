import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { Technician } from "@/types/attendance";
import { TechnicianGroupCell } from "./TechnicianGroupCell";
import { TechnicianActions } from "./TechnicianActions";

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
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
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
  isSelected,
  onSelect,
}: TechnicianTableRowProps) => {
  const handleGroupChange = (groupId: string) => {
    if (editingTechnician) {
      const updatedTechnician = {
        ...editingTechnician,
        group_id: groupId
      };
      setEditingTechnician(updatedTechnician);
      // Immediately update the technician when group changes
      onUpdate(updatedTechnician);
    }
  };

  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select ${tech.name}`}
        />
      </td>
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
        <TechnicianGroupCell
          tech={isEditing ? editingTechnician || tech : tech}
          isEditing={isEditing}
          onGroupChange={handleGroupChange}
        />
      </td>
      <td className="py-3 px-4">
        <TechnicianActions
          tech={tech}
          isEditing={isEditing}
          isUpdating={isUpdating}
          isRemoving={isRemoving}
          onEdit={onEdit}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onCancel={onCancel}
          editingTechnician={editingTechnician}
        />
      </td>
    </tr>
  );
};