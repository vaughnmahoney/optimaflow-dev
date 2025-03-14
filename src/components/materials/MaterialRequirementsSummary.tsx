
import React from 'react';
import { useMRStore } from '@/store/useMRStore';
import { MaterialType } from '@/types/material-requirements';

export const MaterialRequirementsSummary = () => {
  const { drivers, selectedDrivers, selectedWorkOrders } = useMRStore();
  
  // Get all selected work orders
  const getSelectedWorkOrders = () => {
    const workOrders = [];
    
    drivers.forEach(driver => {
      if (selectedDrivers.includes(driver.id)) {
        driver.workOrders.forEach(wo => {
          if (selectedWorkOrders.includes(wo.id)) {
            workOrders.push(wo);
          }
        });
      }
    });
    
    return workOrders;
  };
  
  // Calculate material requirements
  const calculateMaterialRequirements = () => {
    const selectedWOs = getSelectedWorkOrders();
    const materials = [];
    
    selectedWOs.forEach(wo => {
      wo.materials.forEach(material => {
        const existingIndex = materials.findIndex(m => 
          m.type === material.type && 
          m.name === material.name && 
          m.size === material.size
        );
        
        if (existingIndex >= 0) {
          materials[existingIndex].quantity += material.quantity;
          materials[existingIndex].locations.add(wo.locationName);
        } else {
          materials.push({
            ...material,
            locations: new Set([wo.locationName])
          });
        }
      });
    });
    
    return materials.sort((a, b) => {
      // Sort by type first (filter, then coil)
      if (a.type !== b.type) {
        return a.type === MaterialType.Filter ? -1 : 1;
      }
      
      // Then by name
      return a.name.localeCompare(b.name);
    });
  };
  
  const materialRequirements = calculateMaterialRequirements();
  
  if (selectedWorkOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Select drivers and work orders to see material requirements</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materialRequirements.map((material, index) => (
          <div 
            key={`${material.id}-${index}`} 
            className="border rounded-md p-3 shadow-sm"
          >
            <div className="font-medium">
              {material.name}
              {material.size && <span className="ml-1 text-sm text-muted-foreground">({material.size})</span>}
            </div>
            <div className="text-2xl font-bold mt-1">
              {material.quantity} <span className="text-sm font-normal">{material.unit}s</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Used in {material.locations.size} location{material.locations.size !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
