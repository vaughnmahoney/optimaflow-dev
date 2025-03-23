
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Folder } from "lucide-react";
import { WeekGroup } from "./WeekGroup";
import type { Technician, DailyAttendanceRecord } from "@/types/attendance";
import type { WeekGroup as WeekGroupType } from "@/types/attendanceTypes";

interface MonthGroupProps {
  month: string;
  weeks: WeekGroupType[];
  records: DailyAttendanceRecord[];
  technicians: Technician[];
  editingDate: string | null;
  isSubmitting: boolean;
  onEdit: (date: string) => void;
  onStatusChange: (technicianId: string, status: "present" | "absent" | "excused", date: string) => void;
  getTechnicianName: (technicianId: string) => string;
}

export const MonthGroup: React.FC<MonthGroupProps> = ({
  month,
  weeks,
  records,
  technicians,
  editingDate,
  isSubmitting,
  onEdit,
  onStatusChange,
  getTechnicianName,
}) => {
  console.log(`Rendering MonthGroup for ${month} with weeks:`, weeks);
  return (
    <Accordion type="single" collapsible className="border-l-2 border-gray-200">
      <AccordionItem value={month}>
        <AccordionTrigger className="hover:no-underline pl-4">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-primary" />
            <span>{month}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="pl-8 space-y-4">
            {weeks.map((weekGroup) => {
              console.log(`Rendering week ${weekGroup.weekNumber} for ${month}:`, weekGroup);
              // Ensure we only pass records belonging to this specific week
              const weekRecords = weekGroup.records || [];
              return (
                <WeekGroup
                  key={`${weekGroup.weekNumber}-${weekGroup.startDate}`}
                  weekNumber={weekGroup.weekNumber}
                  startDate={weekGroup.startDate}
                  endDate={weekGroup.endDate}
                  records={weekRecords}
                  technicians={technicians}
                  editingDate={editingDate}
                  isSubmitting={isSubmitting}
                  onEdit={onEdit}
                  onStatusChange={onStatusChange}
                  getTechnicianName={getTechnicianName}
                />
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
