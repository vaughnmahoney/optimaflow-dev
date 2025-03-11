
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Flag, XCircle, CheckCheck } from "lucide-react";

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
        return { icon: <CheckCheck className="h-3 w-3" />, bgColor: "bg-purple-500 hover:bg-purple-600" };
      default:
        return { icon: <XCircle className="h-3 w-3" />, bgColor: "bg-gray-500 hover:bg-gray-600" };
    }
  };

  // Get the status label (standardized to match the status type)
  const getStatusLabel = () => {
    if (status === "resolved") {
      return "RESOLVED";
    }
    
    // For non-resolved statuses, display the completion status if available
    return completionStatus?.toUpperCase() || "SUCCESS";
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
