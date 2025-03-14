
import { Card } from "@/components/ui/card";
import { StatusCount } from "./StatusCount";
import { CheckCircle, XCircle, Flag, Clock, CheckCircle2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatusFilterCardsProps {
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
  statusCounts: {
    approved: number;
    pending_review: number;
    flagged: number;
    resolved: number;
    rejected: number;
    all?: number;
  };
}

export const StatusFilterCards = ({
  statusFilter,
  onStatusFilterChange,
  statusCounts,
}: StatusFilterCardsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      <Card
        className={`cursor-pointer hover:border-primary hover:shadow transition-all ${
          statusFilter === null
            ? "border-primary bg-primary/5"
            : "border-gray-200"
        }`}
        onClick={() => onStatusFilterChange(null)}
      >
        <StatusCount
          count={statusCounts.all || 0}
          label={isMobile ? "All" : "All Orders"}
          icon={<Clock className="h-5 w-5 text-blue-500" />}
        />
      </Card>

      <Card
        className={`cursor-pointer hover:border-primary hover:shadow transition-all ${
          statusFilter === "pending_review"
            ? "border-primary bg-primary/5"
            : "border-gray-200"
        }`}
        onClick={() => onStatusFilterChange("pending_review")}
      >
        <StatusCount
          count={statusCounts.pending_review}
          label={isMobile ? "Pending" : "Pending Review"}
          icon={<Clock className="h-5 w-5 text-orange-500" />}
        />
      </Card>

      <Card
        className={`cursor-pointer hover:border-primary hover:shadow transition-all ${
          statusFilter === "flagged"
            ? "border-primary bg-primary/5"
            : "border-gray-200"
        }`}
        onClick={() => onStatusFilterChange("flagged")}
      >
        <StatusCount
          count={statusCounts.flagged}
          label="Flagged"
          icon={<Flag className="h-5 w-5 text-red-500" />}
        />
      </Card>

      <Card
        className={`cursor-pointer hover:border-primary hover:shadow transition-all ${
          statusFilter === "resolved"
            ? "border-primary bg-primary/5"
            : "border-gray-200"
        }`}
        onClick={() => onStatusFilterChange("resolved")}
      >
        <StatusCount
          count={statusCounts.resolved}
          label="Resolved"
          icon={<CheckCircle2 className="h-5 w-5 text-blue-500" />}
        />
      </Card>

      <Card
        className={`cursor-pointer hover:border-primary hover:shadow transition-all ${
          statusFilter === "approved"
            ? "border-primary bg-primary/5"
            : "border-gray-200"
        }`}
        onClick={() => onStatusFilterChange("approved")}
      >
        <StatusCount
          count={statusCounts.approved}
          label="Approved"
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        />
      </Card>
    </div>
  );
};
