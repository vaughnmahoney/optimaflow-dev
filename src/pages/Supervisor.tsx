import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceForm } from "@/components/attendance/AttendanceForm";
import { GroupSelector } from "@/components/groups/GroupSelector";

const Supervisor = () => {
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState<string>();

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
            Select a group and mark attendance for your team
          </p>
        </div>
        
        <div className="max-w-md">
          <GroupSelector
            selectedGroupId={selectedGroupId}
            onGroupSelect={setSelectedGroupId}
          />
        </div>

        {selectedGroupId && <AttendanceForm groupId={selectedGroupId} />}
        
        {!selectedGroupId && (
          <div className="text-center text-gray-500 mt-8">
            Please select a group to view and manage attendance
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Supervisor;