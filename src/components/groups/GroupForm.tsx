import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGroupMutations } from "@/hooks/useGroupMutations";

export const GroupForm = () => {
  const { addGroupMutation } = useGroupMutations();
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
  });

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    addGroupMutation.mutate(
      {
        name: newGroup.name,
        description: newGroup.description || null,
      },
      {
        onSuccess: () => {
          setNewGroup({ name: "", description: "" });
        },
      }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Add New Group</h3>
      <form onSubmit={handleAddGroup} className="space-y-4">
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
          disabled={addGroupMutation.isPending}
        >
          {addGroupMutation.isPending ? "Adding..." : "Add Group"}
        </Button>
      </form>
    </div>
  );
};