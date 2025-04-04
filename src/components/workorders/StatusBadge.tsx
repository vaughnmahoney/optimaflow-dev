
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Flag, XCircle, CheckCheck, AlertTriangle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  completionStatus?: string;
}

export const StatusBadge = ({ status, completionStatus }: StatusBadgeProps) => {
  // Function to get the QC status styling
  const getQcStyling = () => {
    switch (status) {
      case "approved":
        return { 
          icon: <Check className="h-3 w-3" />, 
          bgColor: "bg-green-100 hover:bg-green-200", 
          textColor: "text-green-700"
        };
      case "pending_review":
        return { 
          icon: <Clock className="h-3 w-3" />, 
          bgColor: "bg-yellow-100 hover:bg-yellow-200",
          textColor: "text-yellow-700"
        };
      case "flagged":
      case "flagged_followup":
        return { 
          icon: <Flag className="h-3 w-3" />, 
          bgColor: "bg-red-100 hover:bg-red-200",
          textColor: "text-red-700"
        };
      case "resolved":
        return { 
          icon: <CheckCheck className="h-3 w-3" />, 
          bgColor: "bg-blue-100 hover:bg-blue-200",
          textColor: "text-blue-700"
        };
      case "rejected":
        return { 
          icon: <AlertTriangle className="h-3 w-3" />, 
          bgColor: "bg-orange-100 hover:bg-orange-200",
          textColor: "text-orange-700"
        };
      default:
        return { 
          icon: <XCircle className="h-3 w-3" />, 
          bgColor: "bg-gray-100 hover:bg-gray-200",
          textColor: "text-gray-700"
        };
    }
  };

  // Get the status label - for all statuses, display the underlying OptimoRoute status
  const getStatusLabel = () => {
    // If we have a completion status, display it (regardless of QC status)
    if (completionStatus) {
      return completionStatus.toUpperCase();
    }
    
    // Fallback to displaying the QC status if no completion status is available
    switch (status) {
      case "approved":
        return "APPROVED";
      case "pending_review":
        return "PENDING";
      case "flagged":
      case "flagged_followup":
        return "FLAGGED";
      case "resolved":
        return "RESOLVED";
      case "rejected":
        return "REJECTED";
      default:
        return "UNKNOWN";
    }
  };

  // Get the QC status styling
  const { icon, bgColor, textColor } = getQcStyling();

  return (
    <Badge 
      className={`font-semibold px-2.5 py-1.5 transition-colors ${bgColor} ${textColor} inline-flex items-center gap-1.5 rounded-full shadow-sm border border-transparent hover:shadow`}
      title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
    >
      <span className={textColor}>{icon}</span>
      {getStatusLabel()}
    </Badge>
  );
};
