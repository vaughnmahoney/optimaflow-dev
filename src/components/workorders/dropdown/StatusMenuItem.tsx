
import { Check, Flag, Clock, CheckCheck, AlertTriangle } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface StatusMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const StatusMenuItem = ({ 
  icon, 
  label, 
  onClick, 
  disabled = false 
}: StatusMenuItemProps) => {
  return (
    <DropdownMenuItem 
      className="flex items-center gap-2 cursor-pointer" 
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span>{label}</span>
    </DropdownMenuItem>
  );
};

export const ApproveMenuItem = ({ 
  onClick, 
  disabled = false 
}: { 
  onClick: () => void;
  disabled?: boolean;
}) => (
  <StatusMenuItem 
    icon={<Check className="h-4 w-4 text-green-500" />}
    label="Approve"
    onClick={onClick}
    disabled={disabled}
  />
);

export const FlagMenuItem = ({ 
  onClick, 
  disabled = false 
}: { 
  onClick: () => void;
  disabled?: boolean;
}) => (
  <StatusMenuItem 
    icon={<Flag className="h-4 w-4 text-red-500" />}
    label="Flag"
    onClick={onClick}
    disabled={disabled}
  />
);

export const PendingMenuItem = ({ 
  onClick, 
  disabled = false,
  label = "Mark as Pending"
}: { 
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) => (
  <StatusMenuItem 
    icon={<Clock className="h-4 w-4 text-yellow-500" />}
    label={label}
    onClick={onClick}
    disabled={disabled}
  />
);

export const ResolveMenuItem = ({ 
  onClick, 
  disabled = false 
}: { 
  onClick: () => void;
  disabled?: boolean;
}) => (
  <StatusMenuItem 
    icon={<CheckCheck className="h-4 w-4 text-blue-500" />}
    label="Resolve"
    onClick={onClick}
    disabled={disabled}
  />
);

export const RejectMenuItem = ({ 
  onClick, 
  disabled = false 
}: { 
  onClick: () => void;
  disabled?: boolean;
}) => (
  <StatusMenuItem 
    icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
    label="Reject"
    onClick={onClick}
    disabled={disabled}
  />
);

export const DisabledStatusItem = ({ 
  status 
}: { 
  status: string;
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case "approved":
        return { icon: <Check className="h-4 w-4 text-green-500" />, label: "Approved" };
      case "flagged":
      case "flagged_followup":
        return { icon: <Flag className="h-4 w-4 text-red-500" />, label: "Flagged" };
      case "pending_review":
        return { icon: <Clock className="h-4 w-4 text-yellow-500" />, label: "Pending" };
      case "resolved":
        return { icon: <CheckCheck className="h-4 w-4 text-blue-500" />, label: "Resolved" };
      case "rejected":
        return { icon: <AlertTriangle className="h-4 w-4 text-orange-500" />, label: "Rejected" };
      default:
        return { icon: <Clock className="h-4 w-4 text-gray-500" />, label: "Unknown" };
    }
  };

  const { icon, label } = getStatusInfo();

  return (
    <StatusMenuItem 
      icon={icon}
      label={label}
      onClick={() => {}}
      disabled={true}
    />
  );
};
