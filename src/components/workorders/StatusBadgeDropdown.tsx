
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { StatusMenuItems } from "./dropdown/StatusMenuItems";

interface StatusBadgeDropdownProps {
  workOrderId: string;
  currentStatus: string;
  completionStatus?: string;
  className?: string;
}

export const StatusBadgeDropdown = ({ 
  workOrderId, 
  currentStatus, 
  completionStatus,
  className 
}: StatusBadgeDropdownProps) => {
  // Use the enhanced StatusBadge component instead
  return (
    <StatusBadge
      status={currentStatus}
      completionStatus={completionStatus}
      workOrderId={workOrderId}
      className={className}
    />
  );
};
