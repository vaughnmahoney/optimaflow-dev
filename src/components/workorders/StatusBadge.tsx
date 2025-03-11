
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Flag } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  completionStatus?: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Function to get the status icon, style and label
  const getStatusInfo = () => {
    switch (status) {
      case "approved":
        return { 
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          borderColor: "border-green-200",
          label: "APPROVED"
        };
      case "pending_review":
        return { 
          icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
          bgColor: "bg-yellow-50", 
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
          label: "PENDING" 
        };
      case "flagged":
      case "flagged_followup":
        return { 
          icon: <Flag className="h-3.5 w-3.5 mr-1.5" />,
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
          label: status === "flagged_followup" ? "FOLLOWUP" : "FLAGGED"
        };
      case "resolved":
        return { 
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
          bgColor: "bg-purple-50",
          textColor: "text-purple-700",
          borderColor: "border-purple-200",
          label: "RESOLVED"
        };
      default:
        return { 
          icon: <Clock className="h-3.5 w-3.5 mr-1.5" />, 
          bgColor: "bg-slate-50",
          textColor: "text-slate-700",
          borderColor: "border-slate-200",
          label: status.replace(/_/g, " ").toUpperCase()
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Badge 
      className={cn(
        "rounded-md font-medium text-xs py-0.5 px-2 flex items-center border",
        statusInfo.bgColor,
        statusInfo.textColor,
        statusInfo.borderColor
      )}
    >
      {statusInfo.icon}
      {statusInfo.label}
    </Badge>
  );
};
