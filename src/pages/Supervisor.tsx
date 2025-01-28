import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { AttendanceRecord, Technician } from "@/types/attendance";

const mockTechnicians: Technician[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "(555) 555-5551",
    supervisorId: "mock-supervisor-id",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "(555) 555-5552",
    supervisorId: "mock-supervisor-id",
    createdAt: new Date(),
  },
];

const Supervisor = () => {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleStatusChange = (technicianId: string, status: AttendanceRecord["status"]) => {
    if (isSubmitted) return;

    setAttendance({
      ...attendance,
      [technicianId]: {
        id: Date.now().toString(),
        technicianId,
        supervisorId: "mock-supervisor-id",
        date: new Date(),
        status,
        submittedAt: new Date(),
      },
    });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    toast({
      title: "Attendance submitted",
      description: "Today's attendance has been recorded successfully.",
    });
  };

  const getStatusColor = (status?: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return "bg-success/10 text-success border-success/20";
      case "absent":
        return "bg-danger/10 text-danger border-danger/20";
      case "excused":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-gray-50 text-gray-500 border-gray-200";
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-primary">Supervisor Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Mark attendance for your team
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Today's Attendance</h3>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitted || Object.keys(attendance).length === 0}
            >
              {isSubmitted ? "Submitted" : "Submit Attendance"}
            </Button>
          </div>

          <div className="space-y-4">
            {mockTechnicians.map((tech) => (
              <div
                key={tech.id}
                className="p-4 rounded-lg border bg-gray-50/50 animate-slide-in"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{tech.name}</h4>
                    <p className="text-sm text-gray-500">{tech.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {["present", "absent", "excused"].map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          handleStatusChange(
                            tech.id,
                            status as AttendanceRecord["status"]
                          )
                        }
                        disabled={isSubmitted}
                        className={`px-4 py-2 rounded-md border transition-colors ${
                          attendance[tech.id]?.status === status
                            ? getStatusColor(status as AttendanceRecord["status"])
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Present", color: "success" },
              { label: "Absent", color: "danger" },
              { label: "Excused", color: "warning" },
            ].map(({ label, color }) => (
              <div
                key={label}
                className={`p-4 rounded-lg border bg-${color}/10 border-${color}/20`}
              >
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-2xl font-semibold mt-1">
                  {
                    Object.values(attendance).filter(
                      (record) =>
                        record.status.toLowerCase() === label.toLowerCase()
                    ).length
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Supervisor;