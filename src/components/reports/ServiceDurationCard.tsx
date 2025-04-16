
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ServiceDurationCardProps {
  avgDuration: number;
  isLoading: boolean;
}

export const ServiceDurationCard: React.FC<ServiceDurationCardProps> = ({
  avgDuration,
  isLoading
}) => {
  // Format duration in hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Average Service Duration</CardTitle>
        <CardDescription>
          Average time between scheduled and end time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-2xl font-bold">
            {isLoading ? "Loading..." : avgDuration === 0 ? "No data" : formatDuration(avgDuration)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
