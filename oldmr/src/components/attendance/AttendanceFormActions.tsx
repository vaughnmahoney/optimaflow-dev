
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";

interface AttendanceFormActionsProps {
  isEditing: boolean;
  hasSubmittedToday: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancelEdit: () => void;
}

export const AttendanceFormActions = ({
  isEditing,
  hasSubmittedToday,
  isSubmitting,
  onSubmit,
  onCancelEdit,
}: AttendanceFormActionsProps) => {
  return (
    <div className="mt-8 flex justify-end gap-4">
      {isEditing && (
        <Button 
          variant="outline"
          onClick={onCancelEdit}
          disabled={isSubmitting}
          className="gap-2"
        >
          <XIcon className="h-4 w-4" />
          Cancel
        </Button>
      )}
      <Button 
        onClick={onSubmit}
        disabled={(!isEditing && hasSubmittedToday) || isSubmitting}
        className="gap-2"
      >
        {isSubmitting ? (
          "Submitting..."
        ) : isEditing ? (
          <>
            <CheckIcon className="h-4 w-4" />
            Save Changes
          </>
        ) : hasSubmittedToday ? (
          "Already Submitted"
        ) : (
          "Submit Daily Attendance"
        )}
      </Button>
    </div>
  );
};
