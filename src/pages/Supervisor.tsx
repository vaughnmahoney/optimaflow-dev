import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceForm } from "@/components/attendance/AttendanceForm";
import { GroupForm } from "@/components/groups/GroupForm";
import { GroupTable } from "@/components/groups/GroupTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGroupMutations } from "@/hooks/useGroupMutations";

interface Group {
  id: string;
  name: string;
  description: string | null;
}

const Supervisor = () => {
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState<string>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const { updateGroupMutation, removeGroupMutation } = useGroupMutations();

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

  const handleUpdateGroup = async (group: Group) => {
    await updateGroupMutation.mutateAsync(group, {
      onSuccess: () => {
        setEditingGroup(null);
        // Refresh groups list
        const updatedGroups = groups.map((g) =>
          g.id === group.id ? group : g
        );
        setGroups(updatedGroups);
      },
    });
  };

  const handleRemoveGroup = async (groupId: string) => {
    await removeGroupMutation.mutateAsync(groupId, {
      onSuccess: () => {
        // Remove group from local state
        setGroups(groups.filter((g) => g.id !== groupId));
        // If the removed group was selected, clear selection
        if (selectedGroupId === groupId) {
          setSelectedGroupId(undefined);
        }
      },
    });
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary">Supervisor Dashboard</h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage groups and mark attendance for your team
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Group</DialogTitle>
              </DialogHeader>
              <GroupForm onSuccess={() => {
                setIsDialogOpen(false);
                // Refresh groups list after adding
                const fetchGroups = async () => {
                  const { data } = await supabase
                    .from("groups")
                    .select("id, name, description")
                    .order("name");
                  if (data) setGroups(data);
                };
                fetchGroups();
              }} />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 mt-8">
            {error}
          </div>
        ) : (
          <GroupTable
            groups={groups}
            editingGroup={editingGroup}
            setEditingGroup={setEditingGroup}
            onUpdate={handleUpdateGroup}
            onRemove={handleRemoveGroup}
            isUpdating={updateGroupMutation.isPending}
            isRemoving={removeGroupMutation.isPending}
          />
        )}

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