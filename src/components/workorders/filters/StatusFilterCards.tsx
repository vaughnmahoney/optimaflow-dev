
import { Card, CardContent } from "@/components/ui/card";
import { Check, Flag, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatusFilterCardsProps {
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
}

export const StatusFilterCards = ({
  statusFilter,
  onStatusFilterChange,
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
      textColor: "text-green-500" 
    },
    { 
      label: "Pending Review", 
      value: "pending_review", 
      icon: Clock, 
      color: "bg-yellow-500",
      ringColor: "ring-yellow-500",
      hoverColor: "hover:bg-yellow-600",
      textColor: "text-yellow-500" 
    },
    { 
      label: "Flagged", 
      value: "flagged", 
      icon: Flag, 
      color: "bg-red-500",
      ringColor: "ring-red-500",
      hoverColor: "hover:bg-red-600",
      textColor: "text-red-500" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 w-full mb-2 sm:mb-4">
      {statuses.map((status) => {
        const isActive = statusFilter === status.value;
        
        return (
          <Card 
            key={status.value}
            className={cn(
              "cursor-pointer transition-all overflow-hidden group shadow-sm",
              isActive 
                ? `ring-2 ring-offset-1 sm:ring-offset-2 ${status.ringColor}` 
                : `hover:shadow-md ${status.hoverColor}`
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
              "p-2 sm:p-3 flex items-center justify-between transition-colors",
              isActive ? `${status.color} text-white` : "bg-white"
            )}>
              <div className="flex items-center gap-2">
                <status.icon 
                  size={isMobile ? 16 : 18} 
                  className={isActive ? "text-white" : status.textColor} 
                />
                <h3 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{status.label}</h3>
              </div>
              
              {/* Count badges */}
              <div className={cn(
                "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-medium",
                isActive ? "bg-white text-gray-800" : `bg-gray-100 ${status.textColor}`
              )}>
                0
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
