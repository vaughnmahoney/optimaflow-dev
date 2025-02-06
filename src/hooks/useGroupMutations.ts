
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
    mutationFn: async (group: Group) => {
      console.log("Updating group:", group);
      const { data, error } = await supabase
        .from("groups")
        .update({
          name: group.name,
          description: group.description,
        })
        .eq("id", group.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error in updateGroupMutation:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (updatedGroup) => {
      queryClient.setQueryData<Group[]>(["groups"], (oldGroups = []) => {
        return oldGroups
          .map(g => g.id === updatedGroup.id ? updatedGroup : g)
          .sort((a, b) => a.name.localeCompare(b.name));
      });
      
      toast({
        title: "Group updated",
        description: "The group has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update group. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating group:", error);
    },
  });

  const removeGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      console.log("Starting group removal process for group ID:", groupId);
      
      // First, get the Unassigned group ID
      const { data: unassignedGroup, error: unassignedError } = await supabase
        .from("groups")
        .select("id")
        .eq("name", "Unassigned")
        .single();
      
      if (unassignedError) {
        console.error("Error finding Unassigned group:", unassignedError);
        throw unassignedError;
      }

      if (!unassignedGroup) {
        console.error("Unassigned group not found");
        throw new Error("Unassigned group not found");
      }

      console.log("Found Unassigned group:", unassignedGroup);

      // Get all technicians in the group we're trying to delete
      const { data: technicians, error: techFetchError } = await supabase
        .from("technicians")
        .select("id")
        .eq("group_id", groupId);

      if (techFetchError) {
        console.error("Error fetching technicians:", techFetchError);
        throw techFetchError;
      }

      console.log("Found technicians in group:", technicians?.length || 0);

      // If there are technicians, move them to Unassigned
      if (technicians && technicians.length > 0) {
        const { error: techUpdateError } = await supabase
          .from("technicians")
          .update({ group_id: unassignedGroup.id })
          .eq("group_id", groupId);
        
        if (techUpdateError) {
          console.error("Error updating technicians:", techUpdateError);
          throw techUpdateError;
        }
        console.log("Successfully moved technicians to Unassigned group");
      }

      // Now try to delete the group - removed .single() since we don't need the deleted data
      const { error: deleteError } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);
      
      if (deleteError) {
        console.error("Error deleting group:", deleteError);
        throw deleteError;
      }

      console.log("Group deleted successfully");
      return groupId;
    },
    onSuccess: (groupId) => {
      console.log("Group removal succeeded, updating UI for group:", groupId);
      
      // Immediately remove the group from the cache
      queryClient.setQueryData<Group[]>(["groups"], (oldGroups = []) => {
        return oldGroups.filter(g => g.id !== groupId);
      });
      
      // Invalidate related queries that might be affected
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      
      toast({
        title: "Group removed",
        description: "The group has been removed successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Full error details:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to remove group. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    addGroupMutation,
    updateGroupMutation,
    removeGroupMutation,
  };
};
