import React from 'react';
import { CompletionRateCard } from './CompletionRateCard';
import { TotalJobsCompletedCard } from './TotalJobsCompletedCard';

interface KpiSectionProps {
  reportDate: string | null;
  selectedDrivers: string[];
  selectedCustomerGroups: string[];
  selectedCustomerNames: string[];
}

/**
 * Container component for all KPI cards
 */
export const KpiSection: React.FC<KpiSectionProps> = ({
  reportDate,
  selectedDrivers,
  selectedCustomerGroups,
  selectedCustomerNames
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Completion Rate KPI */}
      <CompletionRateCard
        reportDate={reportDate}
        selectedDrivers={selectedDrivers}
        selectedCustomerGroups={selectedCustomerGroups}
        selectedCustomerNames={selectedCustomerNames}
      />
      
      {/* Total Jobs Completed KPI */}
      <TotalJobsCompletedCard
        reportDate={reportDate}
        selectedDrivers={selectedDrivers}
        selectedCustomerGroups={selectedCustomerGroups}
        selectedCustomerNames={selectedCustomerNames}
      />
      
      {/* Add more KPI cards here as they are implemented */}
      {/* Each KPI card will receive the same props for date and filters */}
    </div>
  );
};
