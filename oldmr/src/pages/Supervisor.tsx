
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SupervisorHeader } from "@/components/supervisor/SupervisorHeader";
import { SupervisorContent } from "@/components/supervisor/SupervisorContent";
import { useGroupMutations } from "@/hooks/useGroupMutations";
import { useSupervisorData } from "@/hooks/useSupervisorData";
import { useToast } from "@/hooks/use-toast";

const Supervisor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { removeGroupMutation } = useGroupMutations();
  const {
    groups,
    isLoading,
    error,
    allGroupsSubmitted,
    undoAllSubmissionsMutation,
    submitToHistoryMutation,
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

  const handleSubmitToHistory = () => {
    submitToHistoryMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Attendance records have been submitted to history",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to submit attendance records to history",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <SupervisorHeader
          allGroupsSubmitted={allGroupsSubmitted}
          onUndoAllSubmissions={() => undoAllSubmissionsMutation.mutate()}
          onSubmitToHistory={handleSubmitToHistory}
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
