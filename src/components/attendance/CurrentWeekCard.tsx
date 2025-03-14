
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from 'date-fns';
import { getWeekStart, getWeekEnd } from "@/utils/dateUtils";
import type { Technician, AttendanceRecord } from "@/types/attendance";
import { DailyAttendanceCard } from "./DailyAttendanceCard";
import { Button } from "@/components/ui/button";
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
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const today = new Date();
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);
  
  // Filter records for current week
  const currentWeekRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= weekStart && recordDate <= weekEnd;
  });

  const dailyRecords = transformAttendanceRecords(currentWeekRecords);

  // Generate array of dates for the current week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const handleDateClick = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setSelectedDate(selectedDate === dateString ? null : dateString);
  };

  const getRecord = (date: string) => {
    return dailyRecords.find(record => record.date === date);
  };

  return (
    <Card className="mb-8 border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">This Week</h3>
        <p className="text-sm text-gray-600">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </p>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-6">
          <div className="flex gap-2 justify-between">
            {weekDates.map((date) => {
              const dateString = format(date, 'yyyy-MM-dd');
              const isSelected = selectedDate === dateString;
              const record = getRecord(dateString);
              const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              
              return (
                <Button
                  key={dateString}
                  variant={isSelected ? "default" : "outline"}
                  className={`
                    flex-1 font-medium 
                    ${isToday ? 'ring-2 ring-primary/70' : ''}
                    ${record ? 'bg-secondary/20' : ''}
                    ${isSelected ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-gray-100'}
                  `}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-medium ${isSelected ? 'text-primary-foreground' : 'text-gray-600'}`}>
                      {format(date, 'EEE')}
                    </span>
                    <span className={`text-sm ${isSelected ? 'text-primary-foreground' : 'text-gray-800'}`}>
                      {format(date, 'd')}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="animate-fade-in">
              {dailyRecords.map((record) => (
                record.date === selectedDate && (
                  <DailyAttendanceCard
                    key={record.date}
                    record={record}
                    technicians={technicians}
                    editingDate={editingDate}
                    isSubmitting={isSubmitting}
                    onEdit={onEdit}
                    onStatusChange={onStatusChange}
                    getTechnicianName={getTechnicianName}
                  />
                )
              ))}
              {!getRecord(selectedDate) && (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md border border-gray-200">
                  No attendance records for {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                </div>
              )}
            </div>
          )}

          {!selectedDate && (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md border border-gray-200">
              Select a day to view attendance records
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
