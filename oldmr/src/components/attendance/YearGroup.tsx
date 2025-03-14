import React from 'react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Folder } from "lucide-react";
import { MonthGroup } from "./MonthGroup";
import type { Technician, DailyAttendanceRecord } from "@/types/attendance";
import type { MonthGroup as MonthGroupType } from "@/types/attendanceTypes";

interface YearGroupProps {
  year: string;
  months: MonthGroupType[];
  records: DailyAttendanceRecord[];
  technicians: Technician[];
  editingDate: string | null;
  isSubmitting: boolean;
  onEdit: (date: string) => void;
  onStatusChange: (technicianId: string, status: "present" | "absent" | "excused", date: string) => void;
  getTechnicianName: (technicianId: string) => string;
}

export const YearGroup: React.FC<YearGroupProps> = ({
  year,
  months,
  records,
  technicians,
  editingDate,
  isSubmitting,
  onEdit,
  onStatusChange,
  getTechnicianName,
}) => {
  return (
    <AccordionItem value={year} className="border rounded-lg p-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          <span className="font-semibold">{year}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pl-6 space-y-4">
          {months.map((monthGroup) => (
            <MonthGroup
              key={monthGroup.month}
              month={monthGroup.month}
              weeks={monthGroup.weeks}
              records={monthGroup.records}
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