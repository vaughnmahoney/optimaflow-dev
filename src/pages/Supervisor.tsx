import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceForm } from "@/components/attendance/AttendanceForm";

const Supervisor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-primary">Supervisor Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Mark attendance for your team
          </p>
        </div>
        <AttendanceForm />
      </div>
    </Layout>
  );
};

export default Supervisor;