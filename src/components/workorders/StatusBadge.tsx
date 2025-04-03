
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
        return { icon: <Check className="h-3 w-3" />, bgColor: "bg-green-500 hover:bg-green-600" };
      case "pending_review":
        return { icon: <Clock className="h-3 w-3" />, bgColor: "bg-yellow-500 hover:bg-yellow-600" };
      case "flagged":
      case "flagged_followup":
        return { icon: <Flag className="h-3 w-3" />, bgColor: "bg-red-500 hover:bg-red-600" };
      case "resolved":
        return { icon: <CheckCheck className="h-3 w-3" />, bgColor: "bg-blue-500 hover:bg-blue-600" };
      case "rejected":
        return { icon: <AlertTriangle className="h-3 w-3" />, bgColor: "bg-orange-500 hover:bg-orange-600" };
      default:
        return { icon: <XCircle className="h-3 w-3" />, bgColor: "bg-gray-500 hover:bg-gray-600" };
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
  const { icon, bgColor } = getQcStyling();

  return (
    <Badge 
      className={`text-white font-semibold px-2.5 py-1.5 transition-colors ${bgColor} inline-flex items-center gap-1.5 rounded-full shadow-sm hover:shadow`}
      title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
    >
      {icon}
      {getStatusLabel()}
    </Badge>
  );
};
