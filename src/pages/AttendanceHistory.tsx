import { Layout } from "@/components/Layout";
import { useAttendanceHistory } from "@/hooks/useAttendanceHistory";
import { useAttendanceUpdate } from "@/hooks/useAttendanceUpdate";
import { AttendanceHeader } from "@/components/attendance/AttendanceHeader";
import { AttendanceContent } from "@/components/attendance/AttendanceContent";

const AttendanceHistory = () => {
  const { technicians, attendanceRecords, isLoading, error, getTechnicianName } = useAttendanceHistory();
  const { editingDate, isSubmitting, setEditingDate, handleStatusChange } = useAttendanceUpdate();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Loading attendance history...</p>
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
          <div className="text-center text-red-500">
            Failed to load attendance records
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <AttendanceHeader />
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