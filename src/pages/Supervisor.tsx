
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SupervisorHeader } from "@/components/supervisor/SupervisorHeader";
import { SupervisorContent } from "@/components/supervisor/SupervisorContent";
import { useGroupMutations } from "@/hooks/useGroupMutations";
import { useSupervisorData } from "@/hooks/useSupervisorData";

const Supervisor = () => {
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { removeGroupMutation } = useGroupMutations();
  const {
    groups,
    isLoading,
    error,
    allGroupsSubmitted,
    undoAllSubmissionsMutation,
  } = useSupervisorData();

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
        <SupervisorHeader
          allGroupsSubmitted={allGroupsSubmitted}
          onUndoAllSubmissions={() => undoAllSubmissionsMutation.mutate()}
          isUndoing={undoAllSubmissionsMutation.isPending}
          onAddGroup={() => setIsAddDialogOpen(true)}
        />
        
        <SupervisorContent
          groups={groups}
          isLoading={isLoading}
          error={error as Error}
          removeGroupMutation={removeGroupMutation}
        />
      </div>
    </Layout>
  );
};

export default Supervisor;
