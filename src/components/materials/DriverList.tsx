
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Driver } from '@/types/material-requirements';
import { useMRStore } from '@/store/useMRStore';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { WorkOrderList } from './WorkOrderList';

interface DriverListProps {
  drivers: Driver[];
  isLoading: boolean;
}

export const DriverList = ({ drivers, isLoading }: DriverListProps) => {
  const { selectedDrivers, toggleDriverSelection, selectAllDrivers } = useMRStore();
  const [expandedDrivers, setExpandedDrivers] = useState<Set<string>>(new Set());

  const toggleDriverExpand = (driverId: string) => {
    setExpandedDrivers(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(driverId)) {
        newExpanded.delete(driverId);
      } else {
        newExpanded.add(driverId);
      }
      return newExpanded;
    });
  };

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
      
      {drivers.map(driver => {
        const isExpanded = expandedDrivers.has(driver.id);
        
        return (
          <div key={driver.id} className="space-y-1">
            <div className="flex items-center gap-2 py-1">
              <Checkbox 
                id={`driver-${driver.id}`}
                checked={selectedDrivers.includes(driver.id)}
                onCheckedChange={() => toggleDriverSelection(driver.id)}
              />
              <button 
                type="button"
                onClick={() => toggleDriverExpand(driver.id)}
                className="flex items-center gap-1 flex-1 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{driver.name}</span>
                <span className="text-xs text-muted-foreground ml-1">
                  ({driver.workOrders.length} orders)
                </span>
              </button>
            </div>
            
            {isExpanded && (
              <WorkOrderList 
                workOrders={driver.workOrders}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
