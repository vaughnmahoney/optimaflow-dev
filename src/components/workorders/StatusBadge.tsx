
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  completionStatus?: string;
}

export const StatusBadge = ({ status, completionStatus }: StatusBadgeProps) => {
  // Function to get badge variant based on QC status
  const getVariant = () => {
    switch (status) {
      case "approved":
        return "success";
      case "pending_review":
        return "warning";
      case "flagged":
      case "flagged_followup":
        return "destructive";
      default:
        return "default";
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
    if (!completionStatus) return status.replace(/_/g, " ").toUpperCase();
    
    return completionStatus.toUpperCase();
  };

  return (
    <div className="flex items-center gap-1.5">
      <Badge variant={getVariant()}>
        {getCompletionStatusText()}
      </Badge>
      {completionStatus && (
        <div 
          className={cn("w-2.5 h-2.5 rounded-full", getQcDotColor())} 
          title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
        />
      )}
    </div>
  );
};
