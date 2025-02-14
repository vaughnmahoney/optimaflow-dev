
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatusSectionProps } from "../types/sidebar";

export const StatusSection = ({ status }: StatusSectionProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground hover:bg-success/90';
      case 'flagged':
        return 'bg-danger text-danger-foreground hover:bg-danger/90';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-2">Status</h4>
      <Badge 
        className={cn(
          "w-full justify-center py-1",
          getStatusColor(status || 'pending_review')
        )}
      >
        {(status || 'PENDING REVIEW').toUpperCase().replace(/_/g, ' ')}
      </Badge>
    </div>
  );
};
