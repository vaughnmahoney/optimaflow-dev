
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Technician } from "@/types/attendance";

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
  const handleUpdateTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTechnician) {
      onUpdate(editingTechnician);
    }
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
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {technicians?.map((tech) => (
            <tr key={tech.id} className="border-b">
              <td className="py-3 px-4">
                {editingTechnician?.id === tech.id ? (
                  <Input
                    value={editingTechnician.name}
                    onChange={(e) =>
                      setEditingTechnician({
                        ...editingTechnician,
                        name: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                ) : (
                  tech.name
                )}
              </td>
              <td className="py-3 px-4">
                {editingTechnician?.id === tech.id ? (
                  <Input
                    type="email"
                    value={editingTechnician.email}
                    onChange={(e) =>
                      setEditingTechnician({
                        ...editingTechnician,
                        email: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                ) : (
                  tech.email
                )}
              </td>
              <td className="py-3 px-4">
                {editingTechnician?.id === tech.id ? (
                  <Input
                    type="tel"
                    value={editingTechnician.phone || ""}
                    onChange={(e) =>
                      setEditingTechnician({
                        ...editingTechnician,
                        phone: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                ) : (
                  tech.phone
                )}
              </td>
              <td className="py-3 px-4">
                {editingTechnician?.id === tech.id ? (
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpdateTechnician}
                      disabled={isUpdating}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTechnician(tech)}
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
                )}
              </td>
            </tr>
          ))}
          {(!technicians || technicians.length === 0) && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-500">
                No technicians added yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
