
import React from 'react';
import { DateRangeSelector } from './DateRangeSelector';
import { DateRange } from 'react-day-picker';
import { DriverFilter } from '../DriverFilter';
import { CustomerGroupFilter } from '../CustomerGroupFilter';
import { CustomerNameFilter } from '../CustomerNameFilter';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type FilterBarProps = {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  selectedDrivers: string[];
  setSelectedDrivers: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCustomerGroups: string[];
  setSelectedCustomerGroups: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCustomerNames: string[];
  setSelectedCustomerNames: React.Dispatch<React.SetStateAction<string[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
};

export const FilterBar: React.FC<FilterBarProps> = ({
  dateRange,
  setDateRange,
  selectedDrivers,
  setSelectedDrivers,
  selectedCustomerGroups,
  setSelectedCustomerGroups,
  selectedCustomerNames,
  setSelectedCustomerNames,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="text-lg font-medium mb-3">Dashboard Filters</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} />
        </div>
        <div>
          <DriverFilter selectedDrivers={selectedDrivers} setSelectedDrivers={setSelectedDrivers} />
        </div>
        <div>
          <CustomerGroupFilter 
            selectedCustomerGroups={selectedCustomerGroups} 
            setSelectedCustomerGroups={setSelectedCustomerGroups} 
          />
        </div>
        <div>
          <CustomerNameFilter
            selectedCustomerNames={selectedCustomerNames}
            setSelectedCustomerNames={setSelectedCustomerNames}
          />
        </div>
        
        {/* Search input */}
        <div className="lg:col-span-5 mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by technician name, store, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
