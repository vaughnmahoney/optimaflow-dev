
import React from 'react';
import { JobsCompletedCard } from './JobsCompletedCard';
import { AverageJobDurationCard } from './AverageJobDurationCard';
import { StatusBreakdownCard } from './StatusBreakdownCard';
import { FlagRateCard } from './FlagRateCard';
import { TechnicianPerformanceCard } from './TechnicianPerformanceCard';
import { MostFlaggedTechniciansCard } from './MostFlaggedTechniciansCard';
import { TopCustomersCard } from './TopCustomersCard';
import { CustomerFlagBreakdownCard } from './CustomerFlagBreakdownCard';
import { MapCard } from './MapCard';
import { CompletionTrendCard } from './CompletionTrendCard';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

type DashboardProps = {
  dateRange: DateRange;
  selectedDrivers: string[];
  selectedCustomerGroups: string[];
  selectedCustomerNames: string[];
  searchQuery: string;
};

export const Dashboard: React.FC<DashboardProps> = ({
  dateRange,
  selectedDrivers,
  selectedCustomerGroups,
  selectedCustomerNames,
  searchQuery
}) => {
  // Format date for API calls - use the selected date or today
  const reportDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Key Performance Indicators - Top Row */}
      <JobsCompletedCard />
      <AverageJobDurationCard 
        reportDate={reportDate}
        selectedDrivers={selectedDrivers}
        selectedCustomerGroups={selectedCustomerGroups}
        selectedCustomerNames={selectedCustomerNames}
      />
      <FlagRateCard />
      
      {/* Map and Charts - Middle Row */}
      <MapCard />
      <CompletionTrendCard />
      
      {/* Additional Charts - Bottom Rows */}
      <TechnicianPerformanceCard />
      <MostFlaggedTechniciansCard />
      <TopCustomersCard />
      <StatusBreakdownCard 
        chartSelectedDate={dateRange?.from}
        selectedDrivers={selectedDrivers}
        selectedCustomerGroups={selectedCustomerGroups}
        selectedCustomerNames={selectedCustomerNames}
      />
      <CustomerFlagBreakdownCard />
    </div>
  );
};
