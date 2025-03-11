
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

  // Function to get text for the OptimoRoute completion status
  const getCompletionStatusText = () => {
    if (!completionStatus) return "PENDING";
    const status = completionStatus.toLowerCase();
    
    switch (status) {
      case "success":
        return "SUCCESS";
      case "failed":
        return "FAILED";
      case "rejected":
        return "REJECTED";
      case "on_route":
        return "ON ROUTE";
      case "pending":
        return "PENDING";
      default:
        return completionStatus.toUpperCase();
    }
  };

  // Get the QC status styling
  const { icon, bgColor } = getQcStyling();

  return (
    <Badge 
      className={`text-white font-medium transition-colors ${bgColor} inline-flex items-center gap-1.5`}
      title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
    >
      {icon}
      {getCompletionStatusText()}
    </Badge>
  );
};
