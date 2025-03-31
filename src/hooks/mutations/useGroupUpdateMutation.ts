
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/groups";

/**
 * Hook for updating an existing group
 */
export const useGroupUpdateMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return updateGroupMutation;
};
