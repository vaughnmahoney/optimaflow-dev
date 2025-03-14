
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
    <AccordionItem value={year} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <AccordionTrigger className="hover:no-underline px-6 py-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <Folder className="h-5 w-5 text-primary" />
          <span className="font-semibold text-gray-800">{year}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 py-2 bg-white">
        <div className="space-y-5 pt-2 pb-3">
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
