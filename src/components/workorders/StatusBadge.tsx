
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  completionStatus?: string;
}

export const StatusBadge = ({ status, completionStatus }: StatusBadgeProps) => {
  // Function to get the QC status dot color 
  const getQcDotColor = () => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "pending_review":
        return "bg-yellow-500";
      case "flagged":
      case "flagged_followup":
        return "bg-red-500";
      default:
        return "bg-gray-400";
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
    if (!completionStatus) return "bg-slate-500";
    
    const status = completionStatus.toLowerCase();
    
    switch (status) {
      case "success":
        return "bg-slate-600";
      case "failed":
      case "rejected":
        return "bg-slate-700";
      case "on_route":
        return "bg-blue-600";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="relative inline-flex">
      <Badge className={`${getBadgeColor()} text-white pr-5`}>
        {getCompletionStatusText()}
      </Badge>
      <div 
        className={cn("w-2.5 h-2.5 rounded-full absolute right-1.5 top-1/2 -translate-y-1/2", getQcDotColor())} 
        title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
      />
    </div>
  );
};
