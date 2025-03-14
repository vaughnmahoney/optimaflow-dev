import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string | null;
}

interface GroupTableProps {
  groups: Group[];
  editingGroup: Group | null;
  setEditingGroup: (group: Group | null) => void;
  onUpdate: (group: Group) => void;
  onRemove: (id: string) => void;
  isUpdating: boolean;
  isRemoving: boolean;
}

export const GroupTable = ({
  groups,
  editingGroup,
  setEditingGroup,
  onUpdate,
  onRemove,
  isUpdating,
  isRemoving,
}: GroupTableProps) => {
  const handleUpdateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup) {
      onUpdate(editingGroup);
    }
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Name</th>
            <th className="text-left py-3 px-4">Description</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups?.map((group) => (
            <tr key={group.id} className="border-b">
              <td className="py-3 px-4">
                {editingGroup?.id === group.id ? (
                  <Input
                    value={editingGroup.name}
                    onChange={(e) =>
                      setEditingGroup({
                        ...editingGroup,
                        name: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                ) : (
                  group.name
                )}
              </td>
              <td className="py-3 px-4">
                {editingGroup?.id === group.id ? (
                  <Textarea
                    value={editingGroup.description || ""}
                    onChange={(e) =>
                      setEditingGroup({
                        ...editingGroup,
                        description: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                ) : (
                  group.description
                )}
              </td>
              <td className="py-3 px-4">
                {editingGroup?.id === group.id ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpdateGroup}
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
                        onClick={() => setEditingGroup(group)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(group.id)}
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
                            onClick={() => setEditingGroup(group)}
                            className="cursor-pointer"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onRemove(group.id)}
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
          {(!groups || groups.length === 0) && (
            <tr>
              <td colSpan={3} className="py-4 text-center text-gray-500">
                No groups added yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};