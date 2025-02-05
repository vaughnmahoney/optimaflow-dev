import { useState } from "react";
import { Layout } from "@/components/Layout";
import { GroupForm } from "@/components/groups/GroupForm";
import { GroupList } from "@/components/groups/GroupList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Group } from "@/types/groups";
import { useToast } from "@/hooks/use-toast";
import { useGroupMutations } from "@/hooks/useGroupMutations";
import { GroupDialog } from "@/components/groups/GroupDialog";

const Groups = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const { toast } = useToast();
  const { updateGroupMutation, removeGroupMutation } = useGroupMutations();

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Group[];
    }
  });

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setIsEditDialogOpen(true);
  };

  const handleRemoveGroup = async (groupId: string) => {
    try {
      await removeGroupMutation.mutateAsync(groupId);
    } catch (error) {
      console.error("Error removing group:", error);
    }
  };

  const handleUpdateSuccess = (updatedGroup?: Group) => {
    setIsEditDialogOpen(false);
    setEditingGroup(null);
  };

  const handleAddSuccess = (newGroup?: Group) => {
    console.log("New group added:", newGroup);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-primary">Group Management</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage groups for your technicians
          </p>
        </div>
        
        <GroupForm onSuccess={handleAddSuccess} />

        <GroupList 
          groups={groups || []}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          onEditGroup={handleEditGroup}
          onRemoveGroup={handleRemoveGroup}
          loading={isLoading}
          error={error?.message}
        />

        <GroupDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Edit Group"
          initialData={editingGroup || undefined}
          onSuccess={handleUpdateSuccess}
        />
      </div>
    </Layout>
  );
};

export default Groups;