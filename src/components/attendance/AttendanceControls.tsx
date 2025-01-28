import { Button } from "@/components/ui/button";
import { AttendanceStats } from "./AttendanceStats";
import type { AttendanceRecord } from "@/types/attendance";

interface AttendanceControlsProps {
  stats: {
    present: number;
    absent: number;
    excused: number;
    total: number;
  };
  allSubmitted: boolean;
  isEditing: boolean;
  onEdit: () => void;
}

export const AttendanceControls = ({
  stats,
  allSubmitted,
  isEditing,
  onEdit,
}: AttendanceControlsProps) => {
  return (
    <div className="flex justify-between items-center">
      <AttendanceStats stats={stats} />
      {allSubmitted && !isEditing && (
        <Button 
          variant="outline"
          onClick={onEdit}
        >
          Edit Attendance
        </Button>
      )}
    </div>
  );
};