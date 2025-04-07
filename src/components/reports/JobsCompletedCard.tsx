
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobsCompletedStats, TimeRange } from "@/hooks/useJobsCompletedStats";
import { BarChart3, ArrowUpRight, ArrowDownRight, CalendarDays, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobsCompletedDetailView } from "./JobsCompletedDetailView";

export const JobsCompletedCard = () => {
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const { 
    total, 
    previousTotal,
    percentChange,
    topTechnician,
    completionRate,
    timeRange,
    setTimeRange,
    isLoading,
    refresh
  } = useJobsCompletedStats();

  const getTimeRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case "today": return "TODAY";
      case "week": return "THIS WEEK";
      case "month": return "THIS MONTH";
      case "quarter": return "THIS QUARTER";
      default: return "THIS WEEK";
    }
  };

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
  };

  const formatCompletionRate = (rate: number): string => {
    return `${Math.round(rate)}%`;
  };

  const formatPercentChange = (change: number): string => {
    if (change === 0) return "0%";
    return `${change > 0 ? "+" : ""}${Math.round(change)}%`;
  };

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={() => setIsDetailViewOpen(true)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium tracking-wider text-gray-500">
            JOBS COMPLETED {getTimeRangeLabel(timeRange)}
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex space-x-2 pt-1">
          {["today", "week", "month", "quarter"].map((period) => (
            <Button
              key={period}
              variant={timeRange === period ? "secondary" : "ghost"}
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                handleTimeRangeChange(period as TimeRange);
              }}
              className="px-2 py-1 h-6 text-xs"
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-24 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center space-x-2">
              <span className="text-3xl font-bold text-blue-500">{total}</span>
              {percentChange !== 0 && (
                <span className={`flex items-center text-sm ${percentChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {percentChange > 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-0.5" />
                  )}
                  {formatPercentChange(percentChange)}
                </span>
              )}
            </div>
            
            <div className="text-sm font-medium text-slate-700">
              {`${formatCompletionRate(completionRate)} COMPLETION RATE`}
            </div>
            
            {topTechnician && (
              <div className="text-sm text-gray-600">
                TOP TECH: {topTechnician.name.split(' ').map(n => n.charAt(0).toUpperCase() + '.').join(' ')} ({topTechnician.count})
              </div>
            )}
            
            <div className="flex justify-center items-center pt-1 text-xs text-blue-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Click for details</span>
            </div>
          </div>
        )}
      </CardContent>

      <JobsCompletedDetailView 
        isOpen={isDetailViewOpen}
        onClose={() => setIsDetailViewOpen(false)}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />
    </Card>
  );
};
