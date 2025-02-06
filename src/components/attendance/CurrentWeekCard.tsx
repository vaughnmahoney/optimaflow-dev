
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from 'date-fns';
import { getWeekStart, getWeekEnd } from "@/utils/dateUtils";
import type { Technician, AttendanceRecord, DailyAttendanceRecord } from "@/types/attendance";
import { DailyAttendanceCard } from "./DailyAttendanceCard";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { transformAttendanceRecords } from "@/utils/attendanceTransformUtils";

interface CurrentWeekCardProps {
  records: AttendanceRecord[];
  technicians: Technician[];
  editingDate: string | null;
  isSubmitting: boolean;
  onEdit: (date: string) => void;
  onStatusChange: (technicianId: string, status: "present" | "absent" | "excused", date: string) => void;
  getTechnicianName: (technicianId: string) => string;
}

export const CurrentWeekCard: React.FC<CurrentWeekCardProps> = ({
  records,
  technicians,
  editingDate,
  isSubmitting,
  onEdit,
  onStatusChange,
  getTechnicianName,
}) => {
  const today = new Date();
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);
  
  // Filter records for current week
  const currentWeekRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= weekStart && recordDate <= weekEnd;
  });

  const dailyRecords = transformAttendanceRecords(currentWeekRecords);

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold">This Week</h3>
        <p className="text-sm text-muted-foreground">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </p>
      </CardHeader>
      <CardContent>
        {dailyRecords.length > 0 ? (
          <div className="space-y-4">
            {dailyRecords.map((record) => (
              <Accordion type="single" collapsible key={record.date}>
                <AccordionItem value={record.date}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span>
                        {format(new Date(record.date), "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <DailyAttendanceCard
                      record={record}
                      technicians={technicians}
                      editingDate={editingDate}
                      isSubmitting={isSubmitting}
                      onEdit={onEdit}
                      onStatusChange={onStatusChange}
                      getTechnicianName={getTechnicianName}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No attendance records for this week
          </div>
        )}
      </CardContent>
    </Card>
  );
};
