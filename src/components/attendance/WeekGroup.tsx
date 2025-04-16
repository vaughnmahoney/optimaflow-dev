
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardHeader } from "@/components/ui/card";
import { Folder } from "lucide-react";
import { DailyAttendanceCard } from "./DailyAttendanceCard";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  console.log(`WeekGroup ${weekNumber} - Start: ${startDate}, End: ${endDate}`);
  console.log('Records for this week:', records);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={`week-${weekNumber}`} className="border border-gray-200 rounded-md overflow-hidden">
        <AccordionTrigger className="hover:no-underline px-5 py-3 bg-gray-50/70">
          <div className="flex items-center gap-2 text-sm">
            <Folder className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">
              Week {weekNumber} ({format(parseISO(startDate), "MMM d")} -{" "}
              {format(parseISO(endDate), "MMM d")})
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-3 pt-3 pb-1 bg-white">
          <div className="space-y-4">
            {records.map((record) => {
              console.log('Rendering record for date:', record.date);
              return (
                <Accordion type="single" collapsible key={record.date} className="mb-3">
                  <AccordionItem value={record.date} className="border border-gray-200 rounded overflow-hidden">
                    <AccordionTrigger className="hover:no-underline px-4 py-2.5 bg-gray-50/50 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">
                          {format(parseISO(record.date), "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-2">
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
              );
            })}
            {records.length === 0 && (
              <div className="text-center py-4 text-gray-500 bg-gray-50/50 rounded-md border border-gray-200 my-2">
                No attendance records for this week
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
