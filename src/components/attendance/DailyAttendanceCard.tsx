
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState('');
  
  console.log('Rendering DailyAttendanceCard for date:', record.date, 'with records:', record.records);

  if (!record || !record.records || record.records.length === 0) {
    console.log('No valid records found for date:', record.date);
    return null;
  }

  const isToday = record.date === new Date().toISOString().split('T')[0];
  const isEditing = editingDate === record.date;

  const filteredRecords = record.records.filter(attendance => {
    const technicianName = getTechnicianName(attendance.technician_id).toLowerCase();
    return technicianName.includes(searchQuery.toLowerCase());
  });

  return (
    <Card>
      {isEditing ? (
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
              <div>
                <CardTitle className="text-lg">
                  {format(parseISO(record.date), "EEEE, MMMM d, yyyy")}
                </CardTitle>
                {isToday && (
                  <span className="text-sm text-primary font-medium">Today</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(record.date)}
                className="gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </Button>
            </div>
            <div className="mt-4 relative">
              <Input
                type="text"
                placeholder="Search by technician name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <SearchIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <AttendanceStats stats={record.stats} />
            <div className="space-y-2 mt-4">
              {filteredRecords.map((attendance) => (
                <div
                  key={attendance.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="font-medium">
                    {getTechnicianName(attendance.technician_id)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      attendance.status === "present"
                        ? "bg-green-100 text-green-800"
                        : attendance.status === "absent"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {attendance.status.charAt(0).toUpperCase() +
                      attendance.status.slice(1)}
                  </span>
                </div>
              ))}
              {filteredRecords.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No technicians found matching your search
                </div>
              )}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};
