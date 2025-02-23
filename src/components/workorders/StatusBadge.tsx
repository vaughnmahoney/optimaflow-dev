
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "approved":
        return {
          variant: "success" as const,
          className: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200/50"
        };
      case "pending_review":
        return {
          variant: "warning" as const,
          className: "bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border-yellow-200/50"
        };
      case "flagged":
        return {
          variant: "destructive" as const,
          className: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200/50"
        };
      default:
        return {
          variant: "default" as const,
          className: "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200/50"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "px-3 py-1 font-medium text-sm rounded-lg border shadow-sm",
        config.className
      )}
    >
      {status.replace(/_/g, " ").toUpperCase()}
    </Badge>
  );
};
