
import React from "react";
import { WorkOrder } from "../../types";
import { QcNotesSheet } from "./QcNotesSheet";
import { ResolutionNotesSheet } from "./ResolutionNotesSheet";

interface MobileNoteButtonsProps {
  workOrder: WorkOrder;
}

export const MobileNoteButtons = ({ workOrder }: MobileNoteButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <QcNotesSheet workOrder={workOrder} />
      <ResolutionNotesSheet workOrder={workOrder} />
    </div>
  );
};
