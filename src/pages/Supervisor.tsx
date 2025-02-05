import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceFormContainer } from "@/components/attendance/AttendanceFormContainer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GroupDialog } from "@/components/groups/GroupDialog";
import { GroupList } from "@/components/groups/GroupList";
import { useGroupMutations } from "@/hooks/useGroupMutations";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/groups";
import { useQuery } from "@tanstack/react-query";

const Supervisor = () => {
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState<string>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const { updateGroupMutation, removeGroupMutation } = useGroupMutations();
  const { toast } = useToast();

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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
    };
    checkAuth();
  }, [navigate]);

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

  const handleAddSuccess = (newGroup?: Group) => {
    setIsAddDialogOpen(false);
    toast({
      title: "Group created",
      description: "The new group has been successfully created.",
    });
  };

  const handleUpdateSuccess = (updatedGroup?: Group) => {
    setIsEditDialogOpen(false);
    setEditingGroup(null);
    toast({
      title: "Group updated",
      description: "The group has been successfully updated.",
    });
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary">Supervisor Dashboard</h2>
            <p className="mt-2 text-sm text-gray-600">
              Select a group and mark attendance for your team
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Group
          </Button>
        </div>

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
    </Layout>
  );
};

export default Supervisor;