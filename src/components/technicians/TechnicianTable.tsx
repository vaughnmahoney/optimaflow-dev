import type { Technician } from "@/types/attendance";
import { TechnicianTableRow } from "./TechnicianTableRow";

interface TechnicianTableProps {
  technicians: Technician[];
  editingTechnician: Technician | null;
  setEditingTechnician: (tech: Technician | null) => void;
  onUpdate: (technician: Technician) => void;
  onRemove: (id: string) => void;
  isUpdating: boolean;
  isRemoving: boolean;
}

export const TechnicianTable = ({
  technicians,
  editingTechnician,
  setEditingTechnician,
  onUpdate,
  onRemove,
  isUpdating,
  isRemoving,
}: TechnicianTableProps) => {
  const handleUpdateTechnician = (technician: Technician) => {
    onUpdate(technician);
  };

  const handleCancelEdit = () => {
    setEditingTechnician(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Name</th>
            <th className="text-left py-3 px-4">Email</th>
            <th className="text-left py-3 px-4">Phone</th>
            <th className="text-left py-3 px-4">Group</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {technicians?.map((tech) => (
            <TechnicianTableRow
              key={tech.id}
              tech={tech}
              isEditing={editingTechnician?.id === tech.id}
              isUpdating={isUpdating}
              isRemoving={isRemoving}
              onEdit={(tech) => setEditingTechnician(tech)}
              onUpdate={handleUpdateTechnician}
              onRemove={onRemove}
              onCancel={handleCancelEdit}
              editingTechnician={editingTechnician}
              setEditingTechnician={setEditingTechnician}
            />
          ))}
          {(!technicians || technicians.length === 0) && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-gray-500">
                No technicians added yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};