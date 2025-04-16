
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/groups";

export const useGroupMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addGroupMutation = useMutation({
    mutationFn: async (groupData: Omit<Group, "id">) => {
      console.log("Adding group:", groupData);
      const { data, error } = await supabase
        .from("groups")
        .insert([groupData])
        .select()
        .single();
      
      if (error) {
        console.error("Error in addGroupMutation:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (newGroup) => {
      queryClient.setQueryData<Group[]>(["groups"], (oldGroups = []) => {
        return [...oldGroups, newGroup].sort((a, b) => a.name.localeCompare(b.name));
      });
      
      toast({
        title: "Group added",
        description: "The group has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to add group. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding group:", error);
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, name, description }: Group) => {
      console.log("Starting group update:", { id, name, description });
      
      // First, check if the group exists and get its current data
      const { data: existingGroup, error: fetchError } = await supabase
        .from("groups")
        .select()
        .eq("id", id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching existing group:", fetchError);
        throw fetchError;
      }

      if (!existingGroup) {
        throw new Error("Group not found");
      }

      // Check if trying to rename Unassigned group
      if (existingGroup.name === "Unassigned" && name !== "Unassigned") {
        throw new Error("Cannot rename the Unassigned group");
      }

      // Perform the update
      const { data, error } = await supabase
        .from("groups")
        .update({ 
          name, 
          description,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .maybeSingle();
      
      if (error) {
        console.error("Error in updateGroupMutation:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("No data returned from update operation");
      }
      
      console.log("Update successful:", data);
      return data;
    },
    onSuccess: (updatedGroup) => {
      // Immediately update the cache
      queryClient.setQueryData<Group[]>(["groups"], (oldGroups = []) => {
        const updated = oldGroups?.map(group => 
          group.id === updatedGroup.id ? updatedGroup : group
        ) || [];
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });
      
      // Force a refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      
      toast({
        title: "Group updated",
        description: "The group has been updated successfully.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message === "Cannot rename the Unassigned group"
        ? "The Unassigned group cannot be renamed."
        : error?.message || "Failed to update group. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error updating group:", error);
    },
  });

  const removeGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      console.log("Starting group removal for ID:", groupId);
      
      // Get the Unassigned group first (we'll need it for moving technicians)
      const { data: unassignedGroup, error: unassignedError } = await supabase
        .from("groups")
        .select("id")
        .eq("name", "Unassigned")
        .maybeSingle();

      if (unassignedError) {
        console.error("Error finding Unassigned group:", unassignedError);
        throw unassignedError;
      }

      if (!unassignedGroup) {
        throw new Error("Unassigned group not found");
      }

      console.log("Found Unassigned group:", unassignedGroup);

      // Move all technicians to Unassigned group
      const { error: updateError } = await supabase
        .from("technicians")
        .update({ group_id: unassignedGroup.id })
        .eq("group_id", groupId);

      if (updateError) {
        console.error("Error updating technicians:", updateError);
        throw updateError;
      }

      console.log("Updated technicians to Unassigned group");

      // Now delete the group
      const { error: deleteError } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);

      if (deleteError) {
        console.error("Error deleting group:", deleteError);
        if (deleteError.message.includes("Cannot delete the Unassigned group")) {
          throw new Error("Cannot delete the Unassigned group");
        }
        throw deleteError;
      }

      console.log("Successfully deleted group");
      return groupId;
    },
    onSuccess: (groupId) => {
      queryClient.setQueryData<Group[]>(["groups"], (oldGroups = []) => {
        return oldGroups.filter(g => g.id !== groupId);
      });
      
      // Also invalidate technicians query since their groups might have changed
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      
      toast({
        title: "Group removed",
        description: "The group has been removed successfully.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message === "Cannot delete the Unassigned group" 
        ? "The Unassigned group cannot be deleted."
        : error?.message || "Failed to remove group. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error removing group:", error);
    },
  });

  return {
    addGroupMutation,
    updateGroupMutation,
    removeGroupMutation,
  };
};
