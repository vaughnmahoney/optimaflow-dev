import { AttendanceRefreshButton } from "./AttendanceRefreshButton";

export const AttendanceHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-primary">Attendance History</h2>
        <p className="mt-2 text-sm text-gray-600">
          View and edit past attendance records
        </p>
      </div>
      <AttendanceRefreshButton />
    </div>
  );
};