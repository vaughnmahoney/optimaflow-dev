
import React from 'react';
import { KpiCard } from './KpiCard';
import { Clock } from 'lucide-react';
import { useAverageJobDuration } from '@/hooks/kpis/useAverageJobDuration';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type AverageJobDurationCardProps = {
  reportDate: string | null;
  selectedDrivers: string[];
  selectedCustomerGroups: string[];
  selectedCustomerNames: string[];
};

export const AverageJobDurationCard: React.FC<AverageJobDurationCardProps> = ({
  reportDate,
  selectedDrivers,
  selectedCustomerGroups,
  selectedCustomerNames
}) => {
  const { isLoading, data, error } = useAverageJobDuration(
    reportDate,
    selectedDrivers,
    selectedCustomerGroups,
    selectedCustomerNames
  );

  // Format duration in hours and minutes
  const formatDuration = (hours: number, minutes: number) => {
    if (hours === 0) {
      return `${minutes} min`;
    }
    
    if (minutes === 0) {
      return `${hours} hr`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const formattedDuration = data ? formatDuration(data.hours, data.minutes) : '--';
  const jobCount = data?.jobCount || 0;

  return (
    <KpiCard
      title="Average Job Duration"
      value={isLoading ? "..." : formattedDuration}
      subtitle={!isLoading && !error ? `Based on ${jobCount} jobs` : undefined}
      icon={<Clock className="h-5 w-5" />}
      loading={isLoading}
      tableData={
        <div className="text-center p-4">
          <h3 className="text-xl font-semibold mb-4">Duration Breakdown</h3>
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold">{data?.hours || 0}</div>
              <div className="text-sm text-muted-foreground">Hours</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold">{data?.minutes || 0}</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold">{data?.jobCount || 0}</div>
              <div className="text-sm text-muted-foreground">Jobs</div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Average time between start and end time across all filtered jobs
          </p>
        </div>
      }
    />
  );
};
