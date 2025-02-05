import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceForm } from "@/components/attendance/AttendanceForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GroupDialog } from "@/components/groups/GroupDialog";
import { GroupList } from "@/components/groups/GroupList";
import { useGroupMutations } from "@/hooks/useGroupMutations";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/groups";

const Supervisor = () => {
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState<string>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateGroupMutation, removeGroupMutation } = useGroupMutations();
  const { toast } = useToast();

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

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setError(null);
        console.log("Fetching groups...");
        
        const { data, error } = await supabase
          .from("groups")
          .select("id, name, description")
          .order("name");

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Groups data received:", data);
        setGroups(data || []);
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to load groups";
        console.error("Error in fetchGroups:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setIsEditDialogOpen(true);
  };

  const handleRemove = async (groupId: string) => {
    try {
      await removeGroupMutation.mutateAsync(groupId);
      setGroups(groups.filter(g => g.id !== groupId));
      toast({
        title: "Group removed",
        description: "The group has been removed successfully.",
      });
    } catch (error) {
      console.error("Error removing group:", error);
      toast({
        title: "Error",
        description: "Failed to remove group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (updatedGroup: Group) => {
    try {
      await updateGroupMutation.mutateAsync(updatedGroup);
      setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
      setIsEditDialogOpen(false);
      setEditingGroup(null);
      toast({
        title: "Group updated",
        description: "The group has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating group:", error);
      toast({
        title: "Error",
        description: "Failed to update group. Please try again.",
        variant: "destructive",
      });
    }
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
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          onEditGroup={handleEdit}
          onRemoveGroup={handleRemove}
          loading={loading}
          error={error}
        />

        <GroupDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          title="Add New Group"
          onSuccess={() => setIsAddDialogOpen(false)}
        />

        <GroupDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Edit Group"
          initialData={editingGroup || undefined}
          onSuccess={handleUpdate}
        />

        {selectedGroupId && <AttendanceForm groupId={selectedGroupId} />}
        
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