
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

  return (
    <Badge variant={getVariant()}>
      {status.replace(/_/g, " ").toUpperCase()}
    </Badge>
  );
};
