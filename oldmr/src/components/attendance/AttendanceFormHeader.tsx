
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";

interface AttendanceFormHeaderProps {
  hasSubmittedToday: boolean;
  isEditing: boolean;
  onEdit: () => void;
}

export const AttendanceFormHeader = ({ 
  hasSubmittedToday, 
  isEditing, 
  onEdit 
}: AttendanceFormHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-semibold">
          Attendance for {format(new Date(), "EEEE, MMMM d, yyyy")}
        </h3>
        <p className="text-sm text-gray-500">
          {hasSubmittedToday && !isEditing
            ? "Today's attendance has been submitted. Click edit to make changes."
            : isEditing
            ? "Edit mode: Make your changes and click save to update the attendance records."
            : "Mark attendance for your team using the radio buttons below"}
        </p>
      </div>
      {hasSubmittedToday && !isEditing && (
        <Button
          variant="outline"
          onClick={onEdit}
          className="gap-2"
        >
          <PencilIcon className="h-4 w-4" />
          Edit
        </Button>
      )}
    </div>
  );
};
