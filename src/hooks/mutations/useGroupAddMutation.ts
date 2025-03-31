
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/groups";

/**
 * Hook for adding a new group
 */
export const useGroupAddMutation = () => {
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

  return addGroupMutation;
};
