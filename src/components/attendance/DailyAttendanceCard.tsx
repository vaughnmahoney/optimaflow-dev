import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { AttendanceList } from "./AttendanceList";
import { AttendanceStats } from "./AttendanceStats";
import type { DailyAttendanceRecord, Technician } from "@/types/attendance";

interface DailyAttendanceCardProps {
  record: DailyAttendanceRecord;
  technicians: Technician[];
  editingDate: string | null;
  isSubmitting: boolean;
  onEdit: (date: string) => void;
  onStatusChange: (technicianId: string, status: "present" | "absent" | "excused", date: string) => void;
  getTechnicianName: (technicianId: string) => string;
}

export const DailyAttendanceCard: React.FC<DailyAttendanceCardProps> = ({
  record,
  technicians,
  editingDate,
  isSubmitting,
  onEdit,
  onStatusChange,
  getTechnicianName,
}) => {
  return (
    <Card key={record.id}>
      {editingDate === record.date ? (
        <AttendanceList
          technicians={technicians}
          todayAttendance={record.records}
          onStatusChange={(techId, status) =>
            onStatusChange(techId, status, record.date)
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
                onClick={() => onEdit(record.date)}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AttendanceStats stats={record.stats} />
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
  );
};