import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/groups";

export const useGroupMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addGroupMutation = useMutation({
    mutationFn: async (groupData: Omit<Group, "id">) => {
      const { data, error } = await supabase
        .from("groups")
        .insert([groupData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Group added",
        description: "The group has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add group. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding group:", error);
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async (group: Group) => {
      const { data, error } = await supabase
        .from("groups")
        .update({
          name: group.name,
          description: group.description,
        })
        .eq("id", group.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Group updated",
        description: "The group has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update group. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating group:", error);
    },
  });

  const removeGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Group removed",
        description: "The group has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove group. Please try again.",
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