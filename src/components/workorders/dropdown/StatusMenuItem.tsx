
import { Check, Flag, Clock, XCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

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

interface DisabledStatusItemProps {
  status: string;
  user?: string;
  timestamp?: string;
}

export const DisabledStatusItem = ({ status, user, timestamp }: DisabledStatusItemProps) => {
  let icon;
  let label;
  let className;
  
  switch (status) {
    case "approved":
      icon = <CheckCircle2 className="mr-2 h-4 w-4" />;
      label = "Approved";
      className = "text-green-600 bg-green-50";
      break;
    case "pending_review":
      icon = <Clock className="mr-2 h-4 w-4" />;
      label = "Pending Review";
      className = "text-yellow-600 bg-yellow-50";
      break;
    case "flagged":
    case "flagged_followup":
      icon = <Flag className="mr-2 h-4 w-4" />;
      label = status === "flagged_followup" ? "Flagged for Followup" : "Flagged";
      className = "text-red-600 bg-red-50";
      break;
    case "resolved":
      icon = <Check className="mr-2 h-4 w-4" />;
      label = "Resolved";
      className = "text-blue-600 bg-blue-50";
      break;
    case "rejected":
      icon = <AlertTriangle className="mr-2 h-4 w-4" />;
      label = "Rejected";
      className = "text-orange-600 bg-orange-50";
      break;
    default:
      icon = <XCircle className="mr-2 h-4 w-4" />;
      label = "Unknown";
      className = "text-gray-600 bg-gray-50";
  }
  
  return (
    <DropdownMenuItem disabled className={`${className} cursor-default font-medium opacity-100 flex flex-col items-start`}>
      <div className="flex items-center w-full">
        {icon}
        Current: {label}
      </div>
      {(user || timestamp) && (
        <div className="pl-6 mt-1 text-xs text-muted-foreground opacity-80">
          {user && timestamp ? (
            `${label} by ${user} ${new Date(timestamp).toLocaleString()}`
          ) : user ? (
            `${label} by ${user}`
          ) : timestamp ? (
            `${label} ${new Date(timestamp).toLocaleString()}`
          ) : null}
        </div>
      )}
    </DropdownMenuItem>
  );
};

