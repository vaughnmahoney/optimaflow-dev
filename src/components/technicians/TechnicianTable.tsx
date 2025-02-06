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

  const handleGroupChange = (technicianId: string, groupId: string) => {
    const technician = technicians.find(t => t.id === technicianId);
    if (technician) {
      onUpdate({
        ...technician,
        group_id: groupId
      });
    }
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
                    value={editingTechnician.email || ""}
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
                <div className="w-[200px]">
                  <GroupSelector
                    selectedGroupId={tech.group_id || undefined}
                    onGroupSelect={(groupId) => handleGroupChange(tech.id, groupId)}
                  />
                </div>
              </td>
              <td className="py-3 px-4">
                {editingTechnician?.id === tech.id ? (
                  <div className="flex gap-2">
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
                  <div className="flex items-center">
                    {/* Desktop view buttons */}
                    <div className="hidden md:flex gap-2">
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
                            onClick={() => setEditingTechnician(tech)}
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