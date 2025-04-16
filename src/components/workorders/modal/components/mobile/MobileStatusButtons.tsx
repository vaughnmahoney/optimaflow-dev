import { useState } from "react";
import { toast } from "sonner";

interface MobileStatusButtonsProps {
  workOrderId: string;
  currentStatus?: string;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
}

export const MobileStatusButtons = ({
  workOrderId,
  currentStatus,
  onStatusUpdate,
  onResolveFlag,
}: MobileStatusButtonsProps) => {
  // This component is now empty as the buttons have been replaced by the StatusBadgeDropdown
  // We're keeping the component to avoid having to update all imports elsewhere
  return null;
};
