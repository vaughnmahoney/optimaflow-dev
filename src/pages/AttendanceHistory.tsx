import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { DailyAttendanceRecord, Technician } from "@/types/attendance";

// Mock data - replace with actual data store later
const mockTechnicians: Technician[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    supervisorId: "supervisor1",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "123-456-7891",
    supervisorId: "supervisor1",
    createdAt: new Date(),
  },
];

const mockAttendanceHistory: DailyAttendanceRecord[] = [
  {
    id: "1",
    date: new Date(),
    records: [
      {
        id: "1",
        technicianId: "1",
        supervisorId: "supervisor1",
        date: new Date(),
        status: "present",
        submittedAt: new Date(),
      },
      {
        id: "2",
        technicianId: "2",
        supervisorId: "supervisor1",
        date: new Date(),
        status: "absent",
        note: "Called in sick",
        submittedAt: new Date(),
      },
    ],
    submittedBy: "supervisor1",
    submittedAt: new Date(),
    stats: {
      present: 1,
      absent: 1,
      excused: 0,
      total: 2,
    },
  },
];

const AttendanceHistory = () => {
  const [openRecords, setOpenRecords] = useState<string[]>([]);

  const toggleRecord = (id: string) => {
    setOpenRecords((current) =>
      current.includes(id)
        ? current.filter((recordId) => recordId !== id)
        : [...current, id]
    );
  };

  const getTechnicianName = (technicianId: string) => {
    return (
      mockTechnicians.find((tech) => tech.id === technicianId)?.name ||
      "Unknown Technician"
    );
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-primary">Attendance History</h2>
          <p className="mt-2 text-sm text-gray-600">
            View past attendance records and statistics
          </p>
        </div>

        {mockAttendanceHistory.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                No attendance records found
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockAttendanceHistory.map((record) => (
              <Card key={record.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">
                    {format(record.date, "MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-100 rounded-lg">
                      <p className="text-sm text-gray-600">Present</p>
                      <p className="text-2xl font-bold text-green-600">
                        {record.stats.present}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-red-100 rounded-lg">
                      <p className="text-sm text-gray-600">Absent</p>
                      <p className="text-2xl font-bold text-red-600">
                        {record.stats.absent}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-yellow-100 rounded-lg">
                      <p className="text-sm text-gray-600">Excused</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {record.stats.excused}
                      </p>
                    </div>
                  </div>

                  <Collapsible
                    open={openRecords.includes(record.id)}
                    onOpenChange={() => toggleRecord(record.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full">
                        View Details
                        <ChevronDown
                          className={`ml-2 h-4 w-4 transition-transform ${
                            openRecords.includes(record.id) ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-2">
                        {record.records.map((attendance) => (
                          <div
                            key={attendance.id}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <span>{getTechnicianName(attendance.technicianId)}</span>
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
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AttendanceHistory;