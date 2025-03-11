
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCheck, Clock, Flag, CheckCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  completionStatus?: string;
}

export const StatusBadge = ({ status, completionStatus }: StatusBadgeProps) => {
  // Function to get the QC status icon and style
  const getQcStatusInfo = () => {
    switch (status) {
      case "approved":
        return { 
          icon: <CheckCheck className="h-3.5 w-3.5 text-green-600 mr-1.5" />,
          dotColor: "bg-green-500",
          textColor: "text-green-700",
          label: "APPROVED"
        };
      case "pending_review":
        return { 
          icon: <Clock className="h-3.5 w-3.5 text-yellow-600 mr-1.5" />,
          dotColor: "bg-yellow-500", 
          textColor: "text-yellow-700",
          label: "PENDING" 
        };
      case "flagged":
      case "flagged_followup":
        return { 
          icon: <Flag className="h-3.5 w-3.5 text-red-600 mr-1.5" />,
          dotColor: "bg-red-500",
          textColor: "text-red-700",
          label: "FLAGGED"
        };
      case "resolved":
        return { 
          icon: <CheckCircle className="h-3.5 w-3.5 text-purple-600 mr-1.5" />,
          dotColor: "bg-purple-500",
          textColor: "text-purple-700",
          label: "RESOLVED"
        };
      default:
        return { 
          icon: <Clock className="h-3.5 w-3.5 text-gray-500 mr-1.5" />, 
          dotColor: "bg-gray-400",
          textColor: "text-gray-700",
          label: status.replace(/_/g, " ").toUpperCase()
        };
    }
  };

  // Function to get text for the OptimoRoute completion status
  const getCompletionStatusText = () => {
    // If no completion status is provided, default to "PENDING"
    if (!completionStatus) return "PENDING";
    
    // Handle common completion status values - case insensitive matching
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
        // For any other value, return it in uppercase
        return completionStatus.toUpperCase();
    }
  };

  // Function to get badge background color based on completion status
  const getBadgeColor = () => {
    if (!completionStatus) return "bg-slate-100 text-slate-600";
    
    const status = completionStatus.toLowerCase();
    
    switch (status) {
      case "success":
        return "bg-slate-200 text-slate-700";
      case "failed":
      case "rejected":
        return "bg-slate-300 text-slate-800";
      case "on_route":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const qcStatusInfo = getQcStatusInfo();

  return (
    <div className="flex gap-2">
      {/* Completion Status Badge */}
      <Badge className={`${getBadgeColor()} rounded-md font-medium shadow-sm`}>
        {getCompletionStatusText()}
      </Badge>

      {/* QC Status Badge */}
      <Badge 
        className={cn(
          "rounded-md font-medium shadow-sm flex items-center gap-1 transition-all duration-200",
          status === "approved" && "bg-green-50 text-green-700 border-green-200",
          status === "pending_review" && "bg-yellow-50 text-yellow-700 border-yellow-200",
          (status === "flagged" || status === "flagged_followup") && "bg-red-50 text-red-700 border-red-200",
          status === "resolved" && "bg-purple-50 text-purple-700 border-purple-200",
          status === "default" && "bg-slate-50 text-slate-700 border-slate-200"
        )}
      >
        {qcStatusInfo.icon}
        {qcStatusInfo.label}
      </Badge>
    </div>
  );
};
