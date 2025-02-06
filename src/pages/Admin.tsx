
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Technician } from "@/types/attendance";
import { TechnicianForm } from "@/components/technicians/TechnicianForm";
import { TechnicianList } from "@/components/technicians/TechnicianList";

const Admin = () => {
  // Fetch technicians
  const { data: technicians, isLoading } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      console.log("Fetching technicians...");
      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching technicians:", error);
        throw error;
      }

      console.log("Fetched technicians:", data);
      return data as Technician[];
    },
  });

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-primary">Admin Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage technicians and view attendance records
          </p>
        </div>

        <TechnicianForm />
        <TechnicianList technicians={technicians || []} isLoading={isLoading} />
      </div>
    </Layout>
  );
};

export default Admin;
