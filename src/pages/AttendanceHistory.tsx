import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAttendanceHistory } from "@/hooks/useAttendanceHistory";
import { transformAttendanceRecords } from "@/utils/attendanceTransformUtils";
import { groupAttendanceRecords } from "@/utils/attendanceUtils";
import { YearGroup } from "@/components/attendance/YearGroup";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const AttendanceHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { technicians, attendanceRecords, isLoading, error, getTechnicianName } = useAttendanceHistory();

  const handleStatusChange = async (technicianId: string, status: "present" | "absent" | "excused", date: string) => {
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

      // Invalidate specific queries
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

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["attendance"] });
      await queryClient.refetchQueries({ queryKey: ["attendance"] });
      toast({
        title: "Success",
        description: "Attendance records refreshed",
      });
    } catch (error: any) {
      console.error("Error refreshing attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to refresh attendance records",
        variant: "destructive",
      });
    }
  };

  console.log('Raw attendance records:', attendanceRecords);
  const dailyRecords = transformAttendanceRecords(attendanceRecords);
  console.log('Transformed daily records:', dailyRecords);
  
  const groupedRecords = groupAttendanceRecords(dailyRecords);
  console.log('Grouped records by year/month:', groupedRecords);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Loading attendance history...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-primary">Attendance History</h2>
            <p className="mt-2 text-sm text-gray-600">
              View and edit past attendance records
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-red-500">Failed to load attendance records</p>
                <Button onClick={handleRefresh} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary">Attendance History</h2>
            <p className="mt-2 text-sm text-gray-600">
              View and edit past attendance records
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {groupedRecords.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                No attendance records found
              </p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {groupedRecords.map((yearGroup) => (
              <YearGroup
                key={yearGroup.year}
                year={yearGroup.year}
                months={yearGroup.months}
                records={dailyRecords}
                technicians={technicians}
                editingDate={editingDate}
                isSubmitting={isSubmitting}
                onEdit={setEditingDate}
                onStatusChange={handleStatusChange}
                getTechnicianName={getTechnicianName}
              />
            ))}
          </Accordion>
        )}
      </div>
    </Layout>
  );
};

export default AttendanceHistory;