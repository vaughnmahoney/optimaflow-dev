
import { Card, CardContent } from "@/components/ui/card";
import { Check, Flag, Clock, CheckCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatusFilterCardsProps {
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
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
  
  const statuses = [
    { 
      label: "Approved", 
      value: "approved", 
      icon: Check, 
      color: "bg-green-500",
      ringColor: "ring-green-500",
      hoverColor: "hover:bg-green-600",
      textColor: "text-green-500",
      lightBg: "bg-green-50"
    },
    { 
      label: "Pending Review", 
      value: "pending_review", 
      icon: Clock, 
      color: "bg-yellow-500",
      ringColor: "ring-yellow-500",
      hoverColor: "hover:bg-yellow-600",
      textColor: "text-yellow-500",
      lightBg: "bg-yellow-50"
    },
    { 
      label: "Flagged", 
      value: "flagged", 
      icon: Flag, 
      color: "bg-red-500",
      ringColor: "ring-red-500",
      hoverColor: "hover:bg-red-600",
      textColor: "text-red-500",
      lightBg: "bg-red-50"
    },
    { 
      label: "Resolved", 
      value: "resolved", 
      icon: CheckCheck, 
      color: "bg-blue-500",
      ringColor: "ring-blue-500",
      hoverColor: "hover:bg-blue-600",
      textColor: "text-blue-500",
      lightBg: "bg-blue-50"
    },
    { 
      label: "Rejected", 
      value: "rejected", 
      icon: AlertTriangle, 
      color: "bg-orange-500",
      ringColor: "ring-orange-500",
      hoverColor: "hover:bg-orange-600",
      textColor: "text-orange-500",
      lightBg: "bg-orange-50"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 w-full mb-2 sm:mb-4">
      {statuses.map((status) => {
        const isActive = statusFilter === status.value;
        const count = statusCounts[status.value] || 0;
        
        return (
          <Card 
            key={status.value}
            className={cn(
              "cursor-pointer transition-all overflow-hidden group shadow-sm hover:shadow-md",
              isActive 
                ? `ring-2 ring-offset-1 sm:ring-offset-2 ${status.ringColor}` 
                : `hover:translate-y-[-2px] ${status.hoverColor}`
            )}
            onClick={() => onStatusFilterChange(
              statusFilter === status.value ? null : status.value
            )}
          >
            <div 
              className={cn(
                "h-1.5 w-full", 
                status.color
              )}
              aria-hidden="true"
            />
            <CardContent className={cn(
              "p-3 sm:p-4 flex items-center justify-between transition-colors",
              isActive ? `${status.color} text-white` : cn("bg-white", status.lightBg)
            )}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full",
                  isActive ? "bg-white/20" : status.color
                )}>
                  <status.icon 
                    size={isMobile ? 16 : 18} 
                    className={isActive ? "text-white" : "text-white"} 
                  />
                </div>
                <h3 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{status.label}</h3>
              </div>
              
              {/* Count badges */}
              <div className={cn(
                "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-medium shadow-sm",
                isActive ? "bg-white text-gray-800" : `bg-white ${status.textColor} border border-gray-100`
              )}>
                {count}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
