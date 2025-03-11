
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
        return { icon: <Check className="h-3 w-3" />, bgColor: "bg-emerald-500 hover:bg-emerald-600" };
      case "pending_review":
        return { icon: <Clock className="h-3 w-3" />, bgColor: "bg-amber-500 hover:bg-amber-600" };
      case "flagged":
      case "flagged_followup":
        return { icon: <Flag className="h-3 w-3" />, bgColor: "bg-rose-500 hover:bg-rose-600" };
      case "resolved":
        return { icon: <CheckCheck className="h-3 w-3" />, bgColor: "bg-indigo-500 hover:bg-indigo-600" };
      default:
        return { icon: <XCircle className="h-3 w-3" />, bgColor: "bg-gray-500 hover:bg-gray-600" };
    }
  };

  // Get the success label for the completion status
  const getSuccessLabel = () => {
    return "SUCCESS";
  };

  // Get the QC status styling
  const { icon, bgColor } = getQcStyling();

  return (
    <Badge 
      className={`text-white font-semibold px-2.5 py-1.5 transition-colors ${bgColor} inline-flex items-center gap-1.5 rounded-full shadow-sm hover:shadow`}
      title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
    >
      {icon}
      {getSuccessLabel()}
    </Badge>
  );
};
