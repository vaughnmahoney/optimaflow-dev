import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { format, parseISO } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Folder } from "lucide-react";
import type { DailyAttendanceRecord, Technician } from "@/types/attendance";
import { groupAttendanceRecords } from "@/utils/attendanceUtils";

const mockTechnicians: Technician[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    supervisor_id: "supervisor1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "123-456-7891",
    supervisor_id: "supervisor1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockAttendanceHistory: DailyAttendanceRecord[] = [
  {
    id: "1",
    date: new Date().toISOString(),
    records: [
      {
        id: "1",
        technician_id: "1",
        supervisor_id: "supervisor1",
        date: new Date().toISOString(),
        status: "present",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        technician_id: "2",
        supervisor_id: "supervisor1",
        date: new Date().toISOString(),
        status: "absent",
        note: "Called in sick",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    submittedBy: "supervisor1",
    submittedAt: new Date().toISOString(),
    stats: {
      present: 1,
      absent: 1,
      excused: 0,
      total: 2,
    },
  },
];

const AttendanceHistory = () => {
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
            View past attendance records organized by year, month, and week
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
                                            <CardHeader className="pb-3">
                                              <CardTitle className="text-lg">
                                                {format(parseISO(record.date), "MMMM d, yyyy")}
                                              </CardTitle>
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
