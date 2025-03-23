
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, RotateCcw, Plus, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SupervisorHeader } from "@/components/supervisor/SupervisorHeader";
import { SupervisorContent } from "@/components/supervisor/SupervisorContent";
import { useGroupMutations } from "@/hooks/useGroupMutations";
import { useSupervisorData } from "@/hooks/useSupervisorData";
import { useToast } from "@/hooks/use-toast";

const Attendance = () => {
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
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>Attendance Tracking System</CardTitle>
            </div>
            <CardDescription>
              Track and manage technician attendance with detailed history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This system allows supervisors to mark technicians as <strong>Present</strong>, <strong>Absent</strong>, or <strong>Excused</strong> and saves records to an attendance history.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800">
                <p className="text-sm font-medium">Future Development Plans:</p>
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  <li>Redesign to match Alex's attendance sheet format</li>
                  <li>OptimoRoute API integration for automatic attendance marking</li>
                  <li>Technicians who submit work orders will be automatically marked as present</li>
                  <li>Only remaining technicians will require manual review</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Attendance Tracking</h1>
          <Link to="/attendance-history">
            <Button variant="outline" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              View History
            </Button>
          </Link>
        </div>

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

export default Attendance;
