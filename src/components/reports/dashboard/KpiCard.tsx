
import React, { ReactNode } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type TrendIndicator = {
  value: number;
  timeframe: string;
  isPositive: boolean;
};

type KpiCardProps = {
  title: string;
  value: string | number | ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  trend?: TrendIndicator;
  chart?: ReactNode;
  loading?: boolean;
  className?: string;
  tableData?: ReactNode;
  cardSize?: 'sm' | 'md' | 'lg' | 'xl';
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  chart,
  loading = false,
  className,
  tableData,
  cardSize = 'md'
}) => {
  const sizeClasses = {
    sm: "col-span-1",
    md: "col-span-1 md:col-span-1",
    lg: "col-span-1 md:col-span-2",
    xl: "col-span-1 md:col-span-3"
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", sizeClasses[cardSize], className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold">{value}</div>
            {subtitle && <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>}
            
            {trend && (
              <div className="flex items-center mt-2">
                <div className={cn(
                  "text-sm font-medium flex items-center",
                  trend.isPositive ? "text-emerald-600" : "text-rose-600"
                )}>
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </div>
                <div className="text-xs text-muted-foreground ml-1">from {trend.timeframe}</div>
              </div>
            )}
            
            {chart && <div className="mt-4">{chart}</div>}
          </>
        )}
      </CardContent>
      {tableData && (
        <CardFooter className="pt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full flex justify-between items-center text-xs">
                <span>View Details</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <DialogTitle>{title} Details</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {tableData}
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  );
};
