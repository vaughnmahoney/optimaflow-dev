
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Driver } from '@/types/material-requirements';
import { useMRStore } from '@/store/useMRStore';
import { Skeleton } from '@/components/ui/skeleton';

interface DriverListProps {
  drivers: Driver[];
  isLoading: boolean;
}

export const DriverList = ({ drivers, isLoading }: DriverListProps) => {
  const { selectedDrivers, toggleDriverSelection, selectAllDrivers } = useMRStore();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
        ))}
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Select a date and import routes to see drivers</p>
      </div>
    );
  }

  const allSelected = drivers.length > 0 && drivers.every(driver => 
    selectedDrivers.includes(driver.id)
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pb-2 border-b mb-4">
        <Checkbox 
          id="select-all"
          checked={allSelected}
          onCheckedChange={(checked) => selectAllDrivers(!!checked)}
        />
        <label htmlFor="select-all" className="text-sm font-medium">
          Select All Drivers
        </label>
      </div>
      
      {drivers.map(driver => (
        <div key={driver.id} className="flex items-center gap-2 py-1">
          <Checkbox 
            id={`driver-${driver.id}`}
            checked={selectedDrivers.includes(driver.id)}
            onCheckedChange={() => toggleDriverSelection(driver.id)}
          />
          <label 
            htmlFor={`driver-${driver.id}`}
            className="flex-1 text-sm cursor-pointer"
          >
            {driver.name} ({driver.workOrders.length} orders)
          </label>
        </div>
      ))}
    </div>
  );
};
