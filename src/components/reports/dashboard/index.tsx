
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Top Row - 4 Small KPI Cards in a square at top left */}
      <JobsCompletedCard />
      <AverageJobDurationCard 
        reportDate={reportDate}
        selectedDrivers={selectedDrivers}
        selectedCustomerGroups={selectedCustomerGroups}
        selectedCustomerNames={selectedCustomerNames}
      />
      <FlagRateCard />
      <StatusBreakdownCard 
        chartSelectedDate={dateRange?.from}
        selectedDrivers={selectedDrivers}
        selectedCustomerGroups={selectedCustomerGroups}
        selectedCustomerNames={selectedCustomerNames}
      />
      
      {/* Top Right - Bar Chart spanning 2 grid columns */}
      <div className="col-span-1 md:col-span-4 lg:col-span-2">
        <TechnicianPerformanceCard />
      </div>

      {/* Bottom Left - Map spanning 2 grid columns */}
      <div className="col-span-1 md:col-span-2">
        <MapCard />
      </div>
      
      {/* Bottom Right - Trend Card spanning 2 grid columns */}
      <div className="col-span-1 md:col-span-2">
        <CompletionTrendCard />
      </div>
      
      {/* Additional Cards - Bottom row */}
      <div className="col-span-1 md:col-span-2">
        <MostFlaggedTechniciansCard />
      </div>
      <div className="col-span-1 md:col-span-2">
        <TopCustomersCard />
      </div>
      <div className="col-span-1 md:col-span-4">
        <CustomerFlagBreakdownCard />
      </div>
    </div>
  );
};
