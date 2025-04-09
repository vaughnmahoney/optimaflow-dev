
import React from 'react';
import { useAverageJobDuration } from '@/hooks/kpis/useAverageJobDuration';
import { KpiCard } from './KpiCard';
import { Clock } from 'lucide-react';

interface AverageJobDurationCardProps {
  reportDate: string | null;
  selectedDrivers: string[];
  selectedCustomerGroups: string[];
  selectedCustomerNames: string[];
}

/**
 * Component that displays the average job duration KPI
 */
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

  // Format the duration in hours and minutes
  const formattedValue = data 
    ? `${data.hours}h ${data.minutes}m` 
    : '--';

  // Create a footer with additional context
  const footer = data && (
    <div>
      Based on {data.jobCount} completed jobs
    </div>
  );

  return (
    <KpiCard
      title="Average Job Duration"
      description="Average time spent on each job"
      value={formattedValue}
      isLoading={isLoading}
      error={error}
      icon={<Clock className="h-5 w-5" />}
      footer={footer}
    />
  );
};
