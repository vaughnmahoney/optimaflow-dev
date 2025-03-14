
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { WorkOrder } from '@/types/material-requirements';
import { useMRStore } from '@/store/useMRStore';
import { MaterialType } from '@/types/material-requirements';
import { Package } from 'lucide-react';

interface WorkOrderListProps {
  driverId: string;
  workOrders: WorkOrder[];
}

export const WorkOrderList = ({ driverId, workOrders }: WorkOrderListProps) => {
  const { selectedWorkOrders, toggleWorkOrderSelection, selectAllWorkOrders } = useMRStore();

  const allSelected = workOrders.length > 0 && 
    workOrders.every(wo => selectedWorkOrders.includes(wo.id));

  // Count materials by type
  const countMaterials = (wo: WorkOrder) => {
    const counts = {
      filter: 0,
      coil: 0
    };
    
    wo.materials.forEach(material => {
      if (material.type === MaterialType.Filter) {
        counts.filter += material.quantity;
      } else if (material.type === MaterialType.Coil) {
        counts.coil += material.quantity;
      }
    });
    
    return counts;
  };

  return (
    <div className="ml-6 mt-2 space-y-2">
      <div className="flex items-center gap-2 pb-1 border-b">
        <Checkbox 
          id={`select-all-${driverId}`}
          checked={allSelected}
          onCheckedChange={(checked) => selectAllWorkOrders(driverId, !!checked)}
        />
        <label htmlFor={`select-all-${driverId}`} className="text-sm font-medium">
          Select All Work Orders
        </label>
      </div>
      
      {workOrders.map(wo => {
        const materialCounts = countMaterials(wo);
        
        return (
          <div key={wo.id} className="flex items-start gap-2 py-1 pl-1 pr-2 rounded-md hover:bg-accent/50">
            <Checkbox 
              id={`wo-${wo.id}`}
              checked={selectedWorkOrders.includes(wo.id)}
              onCheckedChange={() => toggleWorkOrderSelection(wo.id)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <label 
                htmlFor={`wo-${wo.id}`}
                className="flex flex-col text-sm cursor-pointer"
              >
                <span className="font-medium">{wo.locationName}</span>
                <span className="text-xs text-muted-foreground">{wo.address}</span>
                <div className="flex gap-3 mt-1">
                  {materialCounts.filter > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <Package className="h-3 w-3" />
                      <span>{materialCounts.filter} filters</span>
                    </div>
                  )}
                  {materialCounts.coil > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <Package className="h-3 w-3" />
                      <span>{materialCounts.coil} coils</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
};
