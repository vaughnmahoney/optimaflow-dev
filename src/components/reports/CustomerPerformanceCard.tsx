
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Briefcase, TrendingUp } from "lucide-react";

interface CustomerMetric {
  name: string;
  serviceCount: number;
  avgDuration: number;
  completionRate: number;
}

interface CustomerPerformanceCardProps {
  customerData: CustomerMetric;
  isLoading: boolean;
}

export const CustomerPerformanceCard: React.FC<CustomerPerformanceCardProps> = ({
  customerData,
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Customer Performance</CardTitle>
          <CardDescription>Loading customer data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="animate-pulse h-20 w-full bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">{customerData.name}</CardTitle>
        <CardDescription>
          Performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Service Count</p>
              <p className="text-lg font-semibold">{customerData.serviceCount}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Avg. Duration</p>
              <p className="text-lg font-semibold">
                {formatDuration(customerData.avgDuration)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-lg font-semibold">
                {customerData.completionRate}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
