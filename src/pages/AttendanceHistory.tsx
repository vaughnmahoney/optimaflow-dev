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

const AttendanceHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { technicians, attendanceRecords, isLoading, getTechnicianName } = useAttendanceHistory();

  const handleStatusChange = async (technicianId: string, status: "present" | "absent" | "excused", date: string) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("attendance_records")
        .update({ status })
        .eq("technician_id", technicianId)
        .eq("date", date);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance record updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Error",
        description: "Failed to update attendance record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('Before transformation - attendanceRecords:', attendanceRecords);
  const dailyRecords = transformAttendanceRecords(attendanceRecords);
  console.log('After transformation - dailyRecords:', dailyRecords);
  
  const groupedRecords = groupAttendanceRecords(dailyRecords);
  console.log('Final grouped records:', groupedRecords);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>Loading attendance history...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-primary">Attendance History</h2>
          <p className="mt-2 text-sm text-gray-600">
            View and edit past attendance records
          </p>
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
                {...yearGroup}
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