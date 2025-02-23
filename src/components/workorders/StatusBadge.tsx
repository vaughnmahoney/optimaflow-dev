
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Flag, Clock } from "lucide-react";
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
          icon: CheckCircle,
          className: "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200/50"
        };
      case "pending_review":
        return {
          variant: "warning" as const,
          icon: Clock,
          className: "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200/50"
        };
      case "flagged":
        return {
          variant: "destructive" as const,
          icon: Flag,
          className: "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200/50"
        };
      default:
        return {
          variant: "default" as const,
          icon: Clock,
          className: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200/50"
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "px-3 py-1.5 gap-1.5 font-semibold text-sm rounded-full border shadow-sm",
        "inline-flex items-center transition-all duration-200 hover:shadow",
        config.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {status.replace(/_/g, " ").toUpperCase()}
    </Badge>
  );
};
