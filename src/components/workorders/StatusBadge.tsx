
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Clock, Flag, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  completionStatus?: string;
}

export const StatusBadge = ({ status, completionStatus }: StatusBadgeProps) => {
  // Function to get the QC status icon and color
  const getQcIconAndColor = () => {
    switch (status) {
      case "approved":
        return { icon: <Check className="h-3 w-3 text-green-500" />, color: "bg-green-500" };
      case "pending_review":
        return { icon: <Clock className="h-3 w-3 text-yellow-500" />, color: "bg-yellow-500" };
      case "flagged":
      case "flagged_followup":
        return { icon: <Flag className="h-3 w-3 text-red-500" />, color: "bg-red-500" };
      case "resolved":
        return { icon: <Check className="h-3 w-3 text-purple-500" />, color: "bg-purple-500" };
      default:
        return { icon: <XCircle className="h-3 w-3 text-gray-400" />, color: "bg-gray-400" };
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

  // Get the QC status icon and color
  const { icon, color } = getQcIconAndColor();

  return (
    <div className="relative inline-flex items-center">
      <Badge variant="secondary" className="text-gray-700 dark:text-gray-300 pr-6 font-medium">
        {getCompletionStatusText()}
      </Badge>
      <div 
        className="absolute right-1.5 flex items-center justify-center"
        title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
      >
        {icon}
      </div>
    </div>
  );
};
