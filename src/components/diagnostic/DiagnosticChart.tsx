
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useJobsCompletedStats } from "@/hooks/useJobsCompletedStats";

/**
 * DiagnosticChart component - visualizes the data flow pipeline
 * Helps identify where orders might be getting lost in the system
 */
export const DiagnosticChart = () => {
  const { apiCallData, isLoading, error } = useJobsCompletedStats();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Flow Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="w-full h-[250px]" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Data Flow Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 rounded-md border border-red-200">
            <p className="text-red-600">Error loading diagnostic data: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!apiCallData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Flow Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-50 rounded-md">
            <p className="text-slate-600">No diagnostic data available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate efficiency percentages
  const apiToFilteredRatio = apiCallData.filteredCount > 0 
    ? Math.round((apiCallData.filteredCount / apiCallData.totalFetched) * 100) 
    : 0;
    
  const filteredToProcessedRatio = apiCallData.processedCount > 0 && apiCallData.filteredCount > 0
    ? Math.round((apiCallData.processedCount / apiCallData.filteredCount) * 100)
    : 0;
    
  const overallEfficiency = apiCallData.processedCount > 0 && apiCallData.totalFetched > 0
    ? Math.round((apiCallData.processedCount / apiCallData.totalFetched) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Data Flow Diagnostics</span>
          <Badge variant={overallEfficiency > 80 ? "success" : overallEfficiency > 50 ? "warning" : "destructive"}>
            {overallEfficiency}% Overall Efficiency
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Data flow pipeline visualization */}
          <div className="flex items-center justify-between flex-wrap gap-2 md:gap-4">
            <PipelineStep 
              title="API Fetched" 
              count={apiCallData.totalFetched} 
              color="bg-blue-500" 
            />
            
            <ArrowIndicator 
              percentage={apiToFilteredRatio}
              lossCount={apiCallData.totalFetched - apiCallData.filteredCount}
            />
            
            <PipelineStep 
              title="Status Filtered" 
              count={apiCallData.filteredCount} 
              color="bg-purple-500" 
            />
            
            <ArrowIndicator 
              percentage={filteredToProcessedRatio}
              lossCount={apiCallData.filteredCount - apiCallData.processedCount}
            />
            
            <PipelineStep 
              title="Final Processed" 
              count={apiCallData.processedCount} 
              color="bg-green-500" 
            />
          </div>
          
          {/* Status breakdown */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Status Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {apiCallData.statusBreakdown && Object.entries(apiCallData.statusBreakdown).map(([status, count]) => (
                <div key={status} className="bg-slate-50 p-2 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">{status}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for pipeline steps
const PipelineStep = ({ title, count, color }: { title: string, count: number, color: string }) => (
  <div className="flex flex-col items-center">
    <div className={`${color} text-white w-20 h-20 rounded-full flex items-center justify-center`}>
      <span className="text-xl font-bold">{count}</span>
    </div>
    <span className="mt-2 text-sm font-medium">{title}</span>
  </div>
);

// Arrow indicator with efficiency percentage
const ArrowIndicator = ({ percentage, lossCount }: { percentage: number, lossCount: number }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center">
      <ArrowRight className="h-6 w-6 text-slate-400" />
      <Badge variant={percentage > 90 ? "success" : percentage > 70 ? "warning" : "destructive"} className="ml-1">
        {percentage}%
      </Badge>
    </div>
    {lossCount > 0 && (
      <span className="text-xs text-red-500 mt-1">-{lossCount} lost</span>
    )}
  </div>
);
