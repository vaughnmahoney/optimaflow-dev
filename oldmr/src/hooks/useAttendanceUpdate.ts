import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAttendanceUpdate = () => {
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = async (
    technicianId: string,
    status: "present" | "absent" | "excused",
    date: string
  ) => {
    try {
      setIsSubmitting(true);
      console.log(`Updating attendance for technician ${technicianId} on ${date} to ${status}`);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const { data, error } = await supabase
        .from("attendance_records")
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq("technician_id", technicianId)
        .eq("date", date)
        .eq("supervisor_id", session.user.id)
        .select();

      if (error) {
        console.error("Error updating attendance:", error);
        throw error;
      }

      console.log("Update successful:", data);

      toast({
        title: "Success",
        description: "Attendance record updated successfully",
      });

      await queryClient.invalidateQueries({ queryKey: ["attendance"] });
      await queryClient.refetchQueries({ queryKey: ["attendance"] });
      
      setEditingDate(null);
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update attendance record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    editingDate,
    isSubmitting,
    setEditingDate,
    handleStatusChange,
  };
};