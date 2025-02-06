
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Technician } from "@/types/attendance";

export const useTechnicianMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTechnicianMutation = useMutation({
    mutationFn: async (technicianData: Omit<Technician, "id" | "created_at" | "updated_at" | "supervisor_id">) => {
      console.log("Adding technician with data:", technicianData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      console.log("Current user ID:", user.id);

      const { data, error } = await supabase
        .from("technicians")
        .insert([{ ...technicianData, supervisor_id: user.id }])
        .select()
        .single();
      
      if (error) {
        console.error("Error inserting technician:", error);
        throw error;
      }

      console.log("Successfully added technician:", data);
      return data;
    },
    onSuccess: () => {
      console.log("Invalidating technicians query cache");
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Technician added",
        description: "The technician has been added successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Full error object:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add technician. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTechnicianMutation = useMutation({
    mutationFn: async (technician: Technician) => {
      console.log("Updating technician:", technician);
      
      const { data, error } = await supabase
        .from("technicians")
        .update({
          name: technician.name,
          email: technician.email,
          phone: technician.phone,
          group_id: technician.group_id,
        })
        .eq("id", technician.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating technician:", error);
        throw error;
      }

      console.log("Successfully updated technician:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Technician updated",
        description: "The technician has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error updating technician:", error);
      toast({
        title: "Error",
        description: "Failed to update technician. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeTechnicianMutation = useMutation({
    mutationFn: async (technicianId: string) => {
      console.log("Removing technician:", technicianId);
      
      // First, delete all attendance records for this technician
      const { error: attendanceError } = await supabase
        .from("attendance_records")
        .delete()
        .eq("technician_id", technicianId);

      if (attendanceError) {
        console.error("Error deleting attendance records:", attendanceError);
        throw attendanceError;
      }

      // Then delete the technician
      const { error: techError } = await supabase
        .from("technicians")
        .delete()
        .eq("id", technicianId);

      if (techError) {
        console.error("Error deleting technician:", techError);
        throw techError;
      }

      console.log("Successfully removed technician and their attendance records");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Technician removed",
        description: "The technician and their attendance records have been removed successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error removing technician:", error);
      toast({
        title: "Error",
        description: "Failed to remove technician. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    addTechnicianMutation,
    updateTechnicianMutation,
    removeTechnicianMutation,
  };
};
