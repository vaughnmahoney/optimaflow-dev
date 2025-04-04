import { Check, Flag, Clock, XCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface StatusMenuItemProps {
  onClick: () => void;
  label?: string;
}

export const ApproveMenuItem = ({ onClick, label = "Approve" }: StatusMenuItemProps) => {
  return (
    <DropdownMenuItem onClick={onClick} className="text-green-600 hover:text-green-700 hover:bg-green-50">
      <CheckCircle2 className="mr-2 h-4 w-4" />
      {label}
    </DropdownMenuItem>
  );
};

export const FlagMenuItem = ({ onClick, label = "Flag" }: StatusMenuItemProps) => {
  return (
    <DropdownMenuItem onClick={onClick} className="text-red-600 hover:text-red-700 hover:bg-red-50">
      <Flag className="mr-2 h-4 w-4" />
      {label}
    </DropdownMenuItem>
  );
};

export const PendingMenuItem = ({ onClick, label = "Pending" }: StatusMenuItemProps) => {
  return (
    <DropdownMenuItem onClick={onClick} className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
      <Clock className="mr-2 h-4 w-4" />
      {label}
    </DropdownMenuItem>
  );
};

export const ResolveMenuItem = ({ onClick, label = "Resolve" }: StatusMenuItemProps) => {
  return (
    <DropdownMenuItem onClick={onClick} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
      <Check className="mr-2 h-4 w-4" />
      {label}
    </DropdownMenuItem>
  );
};

export const RejectMenuItem = ({ onClick, label = "Reject" }: StatusMenuItemProps) => {
  return (
    <DropdownMenuItem onClick={onClick} className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
      <AlertTriangle className="mr-2 h-4 w-4" />
      {label}
    </DropdownMenuItem>
  );
};

export const DisabledStatusItem = ({ status, workOrder }: { status: string, workOrder?: any }) => {
  let icon;
  let label;
  let className;
  let attribution = null;
  
  switch (status) {
    case "approved":
      icon = <CheckCircle2 className="mr-2 h-4 w-4" />;
      label = "Approved";
      className = "text-green-600 bg-green-50";
      attribution = workOrder?.approved_user && workOrder?.approved_at ? {
        user: workOrder.approved_user,
        time: workOrder.approved_at
      } : null;
      break;
    case "pending_review":
      icon = <Clock className="mr-2 h-4 w-4" />;
      label = "Pending Review";
      className = "text-yellow-600 bg-yellow-50";
      attribution = workOrder?.last_action_user && workOrder?.last_action_at ? {
        user: workOrder.last_action_user,
        time: workOrder.last_action_at
      } : null;
      break;
    case "flagged":
    case "flagged_followup":
      icon = <Flag className="mr-2 h-4 w-4" />;
      label = status === "flagged_followup" ? "Flagged for Followup" : "Flagged";
      className = "text-red-600 bg-red-50";
      attribution = workOrder?.flagged_user && workOrder?.flagged_at ? {
        user: workOrder.flagged_user,
        time: workOrder.flagged_at
      } : null;
      break;
    case "resolved":
      icon = <Check className="mr-2 h-4 w-4" />;
      label = "Resolved";
      className = "text-blue-600 bg-blue-50";
      attribution = workOrder?.resolved_user && workOrder?.resolved_at ? {
        user: workOrder.resolved_user,
        time: workOrder.resolved_at
      } : null;
      break;
    case "rejected":
      icon = <AlertTriangle className="mr-2 h-4 w-4" />;
      label = "Rejected";
      className = "text-orange-600 bg-orange-50";
      attribution = workOrder?.rejected_user && workOrder?.rejected_at ? {
        user: workOrder.rejected_user,
        time: workOrder.rejected_at
      } : null;
      break;
    default:
      icon = <XCircle className="mr-2 h-4 w-4" />;
      label = "Unknown";
      className = "text-gray-600 bg-gray-50";
  }
  
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timestamp;
    }
  };
  
  return (
    <DropdownMenuItem disabled className={`${className} cursor-default font-medium opacity-100 flex flex-col items-start`}>
      <div className="flex items-center w-full">
        {icon}
        <span>Current: {label}</span>
      </div>
      
      {attribution && (
        <div className="text-xs mt-1 ml-6 opacity-80">
          Set by {attribution.user} on {formatTimestamp(attribution.time)}
        </div>
      )}
    </DropdownMenuItem>
  );
};
