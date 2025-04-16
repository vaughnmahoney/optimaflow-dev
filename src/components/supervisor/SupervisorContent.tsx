
import { useState } from "react";
import { GroupList } from "@/components/groups/GroupList";
import { GroupDialog } from "@/components/groups/GroupDialog";
import { AttendanceFormContainer } from "@/components/attendance/AttendanceFormContainer";
import { Group } from "@/types/groups";
import { useGroupMutations } from "@/hooks/useGroupMutations";
import { useToast } from "@/hooks/use-toast";

interface SupervisorContentProps {
  groups: Group[] | undefined;
  isLoading: boolean;
  error: Error | null;
  removeGroupMutation: any;
}

export const SupervisorContent = ({
  groups,
  isLoading,
  error,
  removeGroupMutation,
}: SupervisorContentProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const { toast } = useToast();

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setIsEditDialogOpen(true);
  };

  const handleRemove = async (groupId: string) => {
    try {
      await removeGroupMutation.mutateAsync(groupId);
      toast({
        title: "Group deleted",
        description: "The group has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error removing group:", error);
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    toast({
      title: "Group created",
      description: "The new group has been successfully created.",
    });
  };

  const handleUpdateSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingGroup(null);
    toast({
      title: "Group updated",
      description: "The group has been successfully updated.",
    });
  };

  return (
    <div className="space-y-8">
      <GroupList
        groups={groups || []}
        selectedGroupId={selectedGroupId}
        onSelectGroup={setSelectedGroupId}
        onEditGroup={handleEdit}
        onRemoveGroup={handleRemove}
        loading={isLoading}
        error={error?.message}
        deletingGroupId={removeGroupMutation.isPending ? removeGroupMutation.variables : undefined}
      />

      <GroupDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Group"
        onSuccess={handleAddSuccess}
      />

      <GroupDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Group"
        initialData={editingGroup || undefined}
        onSuccess={handleUpdateSuccess}
      />

      {selectedGroupId && <AttendanceFormContainer groupId={selectedGroupId} />}
      
      {!selectedGroupId && (
        <div className="text-center text-gray-500 mt-8">
          Please select a group to view and manage attendance
        </div>
      )}
    </div>
  );
};
