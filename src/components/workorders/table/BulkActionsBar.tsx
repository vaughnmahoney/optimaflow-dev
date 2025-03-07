
import { Button } from "@/components/ui/button";
import { CheckCircle, Flag, Trash2, XCircle } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onApprove: () => void;
  onFlag: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export const BulkActionsBar = ({
  selectedCount,
  onApprove,
  onFlag,
  onDelete,
  onClearSelection,
}: BulkActionsBarProps) => {
  return (
    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md border mb-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{selectedCount} item{selectedCount !== 1 ? 's' : ''} selected</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          className="h-8"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Clear selection
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onApprove}
          className="h-8 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Approve all
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onFlag}
          className="h-8 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
        >
          <Flag className="h-4 w-4 mr-1" />
          Flag all
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="h-8 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete all
        </Button>
      </div>
    </div>
  );
};
