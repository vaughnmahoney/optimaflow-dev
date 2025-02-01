import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Folder } from "lucide-react";
import type { Technician, AttendanceRecord, DailyAttendanceRecord } from "@/types/attendance";
import { groupAttendanceRecords } from "@/utils/attendanceUtils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MonthGroup } from "@/components/attendance/MonthGroup";

const AttendanceHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch technicians
  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .eq('supervisor_id', session.user.id);
      if (error) throw error;
      return data;
    },
  });

  // Fetch attendance records
  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('supervisor_id', session.user.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as AttendanceRecord[];
    },
  });

  const handleStatusChange = async (technicianId: string, status: AttendanceRecord["status"], date: string) => {
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

  const dailyRecords = transformAttendanceRecords(attendanceRecords);
  const groupedRecords = groupAttendanceRecords(dailyRecords);

  const getTechnicianName = (technician_id: string) => {
    return technicians.find((tech) => tech.id === technician_id)?.name || "Unknown Technician";
  };

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
              <AccordionItem
                key={yearGroup.year}
                value={yearGroup.year}
                className="border rounded-lg p-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{yearGroup.year}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-6 space-y-4">
                    {yearGroup.months.map((monthGroup) => (
                      <MonthGroup
                        key={monthGroup.month}
                        month={monthGroup.month}
                        weeks={monthGroup.weeks}
                        records={monthGroup.records}
                        technicians={technicians}
                        editingDate={editingDate}
                        isSubmitting={isSubmitting}
                        onEdit={setEditingDate}
                        onStatusChange={handleStatusChange}
                        getTechnicianName={getTechnicianName}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </Layout>
  );
};

// Helper function to transform attendance records
const transformAttendanceRecords = (records: AttendanceRecord[]): DailyAttendanceRecord[] => {
  const groupedByDate = records.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = {
        id: date,
        date,
        records: [],
        submittedBy: record.supervisor_id,
        submittedAt: record.submitted_at || '',
        stats: { present: 0, absent: 0, excused: 0, total: 0 }
      };
    }
    acc[date].records.push(record);
    acc[date].stats[record.status as keyof typeof acc[typeof date]['stats']]++;
    acc[date].stats.total++;
    return acc;
  }, {} as Record<string, DailyAttendanceRecord>);

  return Object.values(groupedByDate);
};

export default AttendanceHistory;