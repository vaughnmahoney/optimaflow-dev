
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getVariant = () => {
    switch (status) {
      case "approved":
        return "success";
      case "pending_review":
        return "warning";
      case "flagged":
        return "destructive";
      default:
        return "default";
    }
  };

  const getAnimation = () => {
    switch (status) {
      case "pending_review":
        return "animate-status-pulse";
      case "flagged":
        return "animate-status-shake";
      default:
        return "animate-fade-in";
    }
  };

  return (
    <Badge 
      variant={getVariant()}
      className={`px-4 py-2 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-105 ${getAnimation()}`}
    >
      {status.replace(/_/g, " ").toUpperCase()}
    </Badge>
  );
};
