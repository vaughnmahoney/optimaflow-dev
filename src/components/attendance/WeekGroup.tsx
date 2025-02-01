import React from 'react';
import { format, parseISO } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Folder } from "lucide-react";
import { DailyAttendanceCard } from "./DailyAttendanceCard";
import type { Technician, DailyAttendanceRecord } from "@/types/attendance";

interface WeekGroupProps {
  weekNumber: number;
  startDate: string;
  endDate: string;
  records: DailyAttendanceRecord[];
  technicians: Technician[];
  editingDate: string | null;
  isSubmitting: boolean;
  onEdit: (date: string) => void;
  onStatusChange: (technicianId: string, status: "present" | "absent" | "excused", date: string) => void;
  getTechnicianName: (technicianId: string) => string;
}

export const WeekGroup: React.FC<WeekGroupProps> = ({
  weekNumber,
  startDate,
  endDate,
  records,
  technicians,
  editingDate,
  isSubmitting,
  onEdit,
  onStatusChange,
  getTechnicianName,
}) => {
  // Filter records that fall within this week's date range
  const weekRecords = records.filter(record => {
    const recordDate = record.date;
    return recordDate >= startDate && recordDate <= endDate;
  });

  return (
    <AccordionItem value={weekNumber.toString()}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-primary" />
          <span>
            Week {weekNumber} ({format(parseISO(startDate), "MMM d")} -{" "}
            {format(parseISO(endDate), "MMM d")})
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {weekRecords.map((record) => (
            <DailyAttendanceCard
              key={record.id}
              record={record}
              technicians={technicians}
              editingDate={editingDate}
              isSubmitting={isSubmitting}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
              getTechnicianName={getTechnicianName}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};