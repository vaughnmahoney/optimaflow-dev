
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  completionStatus?: string;
}

export const StatusBadge = ({ status, completionStatus }: StatusBadgeProps) => {
  // Function to get badge color based on completion status
  const getBadgeColor = () => {
    if (!completionStatus || completionStatus === 'N/A') return "bg-slate-500";

    switch (completionStatus.toLowerCase()) {
      case 'success':
        return "bg-green-500 text-white";
      case 'on_route':
        return "bg-blue-500 text-white";
      case 'failed':
      case 'rejected':
        return "bg-red-700 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  // Function to get dot color based on QC status
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
    // Special case handling - if completionStatus is 'N/A', display it
    if (!completionStatus || completionStatus === 'N/A') {
      return "N/A";
    }
    
    return completionStatus.toUpperCase();
  };

  return (
    <div className="flex items-center gap-1.5">
      <Badge className={cn("capitalize font-medium", getBadgeColor())}>
        {getCompletionStatusText()}
      </Badge>
      <div 
        className={cn("w-2.5 h-2.5 rounded-full", getQcDotColor())} 
        title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
      />
    </div>
  );
};
