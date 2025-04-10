import React from 'react';
import { useCompletionRate } from '@/hooks/kpis/useCompletionRate';
import { KpiCard } from './KpiCard';
import { CheckCircle } from 'lucide-react';

interface CompletionRateCardProps {
  reportDate: string | null;
  selectedDrivers: string[];
  selectedCustomerGroups: string[];
  selectedCustomerNames: string[];
}

/**
 * Component that displays the completion rate KPI
 */
export const CompletionRateCard: React.FC<CompletionRateCardProps> = ({
  reportDate,
  selectedDrivers,
  selectedCustomerGroups,
  selectedCustomerNames
}) => {
  const { isLoading, data, error } = useCompletionRate(
    reportDate,
    selectedDrivers,
    selectedCustomerGroups,
    selectedCustomerNames
  );

  // Format the completion rate with a percentage sign
  const formattedValue = data 
    ? `${data.completionRate}%` 
    : '0%';

  // Create a footer with additional context
  const footer = data && (
    <div>
      {data.completedJobs} of {data.totalJobs} jobs completed successfully
    </div>
  );

  return (
    <KpiCard
      title="Completion Rate"
      description="Percentage of jobs successfully completed"
      value={formattedValue}
      isLoading={isLoading}
      error={error}
      icon={<CheckCircle className="h-5 w-5" />}
      footer={footer}
    />
  );
};
