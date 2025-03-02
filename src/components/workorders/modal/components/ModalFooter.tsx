
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Flag } from "lucide-react";

interface ModalFooterProps {
  workOrderId: string;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  isImageExpanded: boolean;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  workOrderId,
  onStatusUpdate,
  isImageExpanded
}) => {
  if (isImageExpanded) return null;
  
  return (
    <div className="p-4 border-t flex items-center justify-between">
      <div className="space-x-2 flex-1">
        <Button
          variant="outline"
          className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 bg-red-50"
          onClick={() => onStatusUpdate(workOrderId, "flagged")}
        >
          <Flag className="h-4 w-4 mr-2" />
          Flag for Review
        </Button>
      </div>
      
      <div>
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => onStatusUpdate(workOrderId, "approved")}
        >
          <Check className="h-4 w-4 mr-2" />
          Approve
        </Button>
      </div>
    </div>
  );
};
