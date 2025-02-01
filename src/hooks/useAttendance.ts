import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Technician } from "@/types/attendance";

export const useAttendance = () => {
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .eq("supervisor_id", session.user.id)
        .order("name");
      
      if (error) throw error;
      return data as Technician[];
    },
  });

  return {
    technicians,
    isLoadingTechnicians,
  };
};