
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Technician } from "@/types/attendance";

export const useTechnicianMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTechnicianMutation = useMutation({
    mutationFn: async (technicianData: Omit<Technician, "id" | "created_at" | "updated_at" | "supervisor_id">) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("technicians")
        .insert([{ ...technicianData, supervisor_id: user.data.user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Technician added",
        description: "The technician has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add technician. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding technician:", error);
    },
  });

  const updateTechnicianMutation = useMutation({
    mutationFn: async (technician: Technician) => {
      const { data, error } = await supabase
        .from("technicians")
        .update({
          name: technician.name,
          email: technician.email,
          phone: technician.phone,
        })
        .eq("id", technician.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Technician updated",
        description: "The technician has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update technician. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating technician:", error);
    },
  });

  const removeTechnicianMutation = useMutation({
    mutationFn: async (technicianId: string) => {
      const { error } = await supabase
        .from("technicians")
        .delete()
        .eq("id", technicianId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Technician removed",
        description: "The technician has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove technician. Please try again.",
        variant: "destructive",
      });
      console.error("Error removing technician:", error);
    },
  });

  return {
    addTechnicianMutation,
    updateTechnicianMutation,
    removeTechnicianMutation,
  };
};
