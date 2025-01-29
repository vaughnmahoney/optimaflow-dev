import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { AttendanceRecord } from "@/types/attendance";

export const useAttendanceSubmission = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmission = async (records: Omit<AttendanceRecord, "id" | "submitted_at" | "updated_at">[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to submit attendance.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("attendance_records")
        .upsert(records.map(record => ({
          ...record,
          supervisor_id: session.user.id,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })))
        .select();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({
        title: "Success",
        description: isEditing 
          ? "Successfully updated today's attendance"
          : "Today's attendance has been recorded",
      });
      setIsEditing(false);
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit attendance. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isEditing,
    setIsEditing,
    handleSubmission,
  };
};