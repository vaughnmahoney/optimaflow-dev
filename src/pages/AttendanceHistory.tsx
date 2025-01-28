import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { format, parseISO } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Folder, PencilIcon } from "lucide-react";
import type { DailyAttendanceRecord, Technician, AttendanceRecord } from "@/types/attendance";
import { groupAttendanceRecords } from "@/utils/attendanceUtils";
import { useState } from "react";
import { AttendanceList } from "@/components/attendance/AttendanceList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const AttendanceHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Invalidate queries to refresh the data
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

  const groupedRecords = groupAttendanceRecords(mockAttendanceHistory);

  const getTechnicianName = (technician_id: string) => {
    return (
      mockTechnicians.find((tech) => tech.id === technician_id)?.name ||
      "Unknown Technician"
    );
  };

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
                      <Accordion
                        key={monthGroup.month}
                        type="single"
                        collapsible
                        className="border-l-2 border-gray-200"
                      >
                        <AccordionItem value={monthGroup.month}>
                          <AccordionTrigger className="hover:no-underline pl-4">
                            <div className="flex items-center gap-2">
                              <Folder className="h-4 w-4 text-primary" />
                              <span>{monthGroup.month}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-8 space-y-4">
                              {monthGroup.weeks.map((weekGroup) => (
                                <Accordion
                                  key={weekGroup.weekNumber}
                                  type="single"
                                  collapsible
                                >
                                  <AccordionItem value={weekGroup.weekNumber.toString()}>
                                    <AccordionTrigger className="hover:no-underline">
                                      <div className="flex items-center gap-2">
                                        <Folder className="h-4 w-4 text-primary" />
                                        <span>
                                          Week {weekGroup.weekNumber} (
                                          {format(parseISO(weekGroup.startDate), "MMM d")} -{" "}
                                          {format(parseISO(weekGroup.endDate), "MMM d")})
                                        </span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-4">
                                        {weekGroup.records.map((record) => (
                                          <Card key={record.id}>
                                            {editingDate === record.date ? (
                                              <AttendanceList
                                                technicians={mockTechnicians}
                                                todayAttendance={record.records}
                                                onStatusChange={(techId, status) =>
                                                  handleStatusChange(techId, status, record.date)
                                                }
                                                isSubmitting={isSubmitting}
                                                date={parseISO(record.date)}
                                                isEditable={true}
                                              />
                                            ) : (
                                              <>
                                                <CardHeader className="pb-3">
                                                  <div className="flex justify-between items-center">
                                                    <CardTitle className="text-lg">
                                                      {format(parseISO(record.date), "EEEE, MMMM d, yyyy")}
                                                    </CardTitle>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => setEditingDate(record.date)}
                                                    >
                                                      <PencilIcon className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </CardHeader>
                                                <CardContent>
                                              <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div className="text-center p-3 bg-green-100 rounded-lg">
                                                  <p className="text-sm text-gray-600">Present</p>
                                                  <p className="text-xl font-bold text-green-600">
                                                    {record.stats.present}
                                                  </p>
                                                </div>
                                                <div className="text-center p-3 bg-red-100 rounded-lg">
                                                  <p className="text-sm text-gray-600">Absent</p>
                                                  <p className="text-xl font-bold text-red-600">
                                                    {record.stats.absent}
                                                  </p>
                                                </div>
                                                <div className="text-center p-3 bg-yellow-100 rounded-lg">
                                                  <p className="text-sm text-gray-600">Excused</p>
                                                  <p className="text-xl font-bold text-yellow-600">
                                                    {record.stats.excused}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="space-y-2">
                                                {record.records.map((attendance) => (
                                                  <div
                                                    key={attendance.id}
                                                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                                  >
                                                    <span>
                                                      {getTechnicianName(attendance.technician_id)}
                                                    </span>
                                                    <span
                                                      className={`px-2 py-1 rounded text-sm ${
                                                        attendance.status === "present"
                                                          ? "bg-green-100 text-green-800"
                                                          : attendance.status === "absent"
                                                          ? "bg-red-100 text-red-800"
                                                          : "bg-yellow-100 text-yellow-800"
                                                      }`}
                                                    >
                                                      {attendance.status.charAt(0).toUpperCase() +
                                                        attendance.status.slice(1)}
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                                </CardContent>
                                              </>
                                            )}
                                          </Card>
                                        ))}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
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

export default AttendanceHistory;
