import { Input } from "@/components/ui/input";
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
        <TechnicianGroupCell
          tech={tech}
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