
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

  // Function to get text for the OptimoRoute completion status ONLY
  const getCompletionStatusText = () => {
    // If no completion status is provided, show a generic "PENDING" status
    if (!completionStatus) return "PENDING";
    
    // Always return the OptimoRoute completion status in uppercase
    return completionStatus.toUpperCase();
  };

  return (
    <div className="relative inline-flex">
      <Badge className="bg-slate-500 text-white pr-5">
        {getCompletionStatusText()}
      </Badge>
      <div 
        className={cn("w-2.5 h-2.5 rounded-full absolute right-1.5 top-1/2 -translate-y-1/2", getQcDotColor())} 
        title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
      />
    </div>
  );
};
