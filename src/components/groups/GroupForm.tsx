
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGroupMutations } from "@/hooks/useGroupMutations";
import { Group } from "@/types/groups";

interface GroupFormProps {
  initialData?: Group;
  onSuccess?: (group?: Group) => void;
}

export const GroupForm = ({ initialData, onSuccess }: GroupFormProps) => {
  const { addGroupMutation, updateGroupMutation } = useGroupMutations();
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setNewGroup({
        name: initialData.name,
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initialData) {
      // Update existing group
      await updateGroupMutation.mutateAsync({
          id: initialData.id,
          name: newGroup.name,
          description: newGroup.description || null,
        },
        {
          onSuccess: (updatedGroup) => {
            setNewGroup({ name: "", description: "" });
            onSuccess?.(updatedGroup);
          },
        }
      );
    } else {
      // Create new group
      await addGroupMutation.mutateAsync(
        {
          name: newGroup.name,
          description: newGroup.description || null,
        },
        {
          onSuccess: (newGroup) => {
            setNewGroup({ name: "", description: "" });
            onSuccess?.(newGroup);
          },
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            value={newGroup.name}
            onChange={(e) =>
              setNewGroup({ ...newGroup, name: e.target.value })
            }
            required
            className="mt-1"
            placeholder="Engineering Team"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description (optional)
          </label>
          <Textarea
            value={newGroup.description}
            onChange={(e) =>
              setNewGroup({ ...newGroup, description: e.target.value })
            }
            className="mt-1"
            placeholder="Team responsible for maintenance and repairs"
          />
        </div>
      </div>
      <Button 
        type="submit"
        disabled={addGroupMutation.isPending || updateGroupMutation.isPending}
      >
        {initialData ? "Update Group" : "Add Group"}
      </Button>
    </form>
  );
};
