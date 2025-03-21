
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";

interface SupervisorHeaderProps {
  allGroupsSubmitted: boolean;
  onUndoAllSubmissions: () => void;
  onSubmitToHistory: () => void;
  isUndoing: boolean;
  onAddGroup: () => void;
}

export const SupervisorHeader = ({
  allGroupsSubmitted,
  onUndoAllSubmissions,
  isUndoing,
  onAddGroup,
}: SupervisorHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-primary">Supervisor Dashboard</h2>
        <p className="mt-2 text-sm text-gray-600">
          Select a group and mark attendance for your team
        </p>
      </div>
      <div className="flex gap-4">
        {allGroupsSubmitted && (
          <Button 
            variant="outline" 
            onClick={onUndoAllSubmissions}
            disabled={isUndoing}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Undo All Submissions
          </Button>
        )}
        <Button variant="outline" onClick={onAddGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Group
        </Button>
      </div>
    </div>
  );
};
