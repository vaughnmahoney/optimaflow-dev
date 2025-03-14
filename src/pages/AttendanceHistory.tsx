
import { Layout } from "@/components/Layout";
import { useAttendanceHistory } from "@/hooks/useAttendanceHistory";
import { useAttendanceUpdate } from "@/hooks/useAttendanceUpdate";
import { AttendanceHeader } from "@/components/attendance/AttendanceHeader";
import { AttendanceContent } from "@/components/attendance/AttendanceContent";
import { CurrentWeekCard } from "@/components/attendance/CurrentWeekCard";
import { Card, CardContent } from "@/components/ui/card";

const AttendanceHistory = () => {
  const { technicians, attendanceRecords, isLoading, error, getTechnicianName } = useAttendanceHistory();
  const { editingDate, isSubmitting, setEditingDate, handleStatusChange } = useAttendanceUpdate();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading attendance history...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-8 animate-fade-in">
          <AttendanceHeader />
          <Card className="border-destructive/50 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center text-destructive font-medium">
                Failed to load attendance records
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <AttendanceHeader />
        
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Attendance Records</h2>
          <p className="text-gray-600">
            View and manage employee attendance history by date
          </p>
        </div>
        
        <CurrentWeekCard
          records={attendanceRecords}
          technicians={technicians}
          editingDate={editingDate}
          isSubmitting={isSubmitting}
          onEdit={setEditingDate}
          onStatusChange={handleStatusChange}
          getTechnicianName={getTechnicianName}
        />
        
        <AttendanceContent
          records={attendanceRecords}
          technicians={technicians}
          editingDate={editingDate}
          isSubmitting={isSubmitting}
          onEdit={setEditingDate}
          onStatusChange={handleStatusChange}
          getTechnicianName={getTechnicianName}
        />
      </div>
    </Layout>
  );
};

export default AttendanceHistory;
