import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface KpiCardProps {
  title: string;
  description?: string;
  value: string | number | ReactNode;
  isLoading: boolean;
  error: string | null;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  footer?: ReactNode;
}

/**
 * A reusable card component for displaying KPIs
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  description,
  value,
  isLoading,
  error,
  icon,
  trend,
  footer
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold">{value}</div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        
        {trend && (
          <div className={`text-sm flex items-center ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span className="ml-1">{trend.value}%</span>
            <span className="ml-1 text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {renderContent()}
        {!isLoading && !error && footer && (
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
