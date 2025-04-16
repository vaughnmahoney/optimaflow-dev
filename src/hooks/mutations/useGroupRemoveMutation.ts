
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/groups";

/**
 * Hook for removing a group
 */
export const useGroupRemoveMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return removeGroupMutation;
};
