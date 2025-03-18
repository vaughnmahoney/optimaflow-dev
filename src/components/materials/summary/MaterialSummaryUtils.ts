
import { MaterialItem } from "@/hooks/materials/useMRStore";

export interface MaterialSummaryItem {
  type: string;
  quantity: number;
}

export interface PackagingUnit {
  label: string;
  count: number;
  unit: string;
}

export const groupMaterialsByType = (materials: MaterialItem[]): MaterialSummaryItem[] => {
  // Group materials by type
  const materialsByType: Record<string, number> = {};
  
  materials.forEach(item => {
    const type = item.type;
    if (!materialsByType[type]) {
      materialsByType[type] = 0;
    }
    materialsByType[type] += item.quantity;
  });
  
  // Convert to array for rendering and sort by type
  return Object.entries(materialsByType)
    .map(([type, quantity]) => ({ type, quantity }))
    .sort((a, b) => {
      // Sort special types first
      if (a.type === 'CONDCOIL') return -1;
      if (b.type === 'CONDCOIL') return 1;
      if (a.type.includes('FREEZER') || a.type.includes('COOLER')) return -1;
      if (b.type.includes('FREEZER') || b.type.includes('COOLER')) return 1;
      
      // Sort alphabetically by type
      return a.type.localeCompare(b.type);
    });
};

export const calculatePackagingUnits = (summaryItems: MaterialSummaryItem[]): Record<string, PackagingUnit> => {
  const packagingUnits: Record<string, PackagingUnit> = {};
  
  // Count filter types
  const polyesters = summaryItems
    .filter(item => item.type.startsWith('S'))
    .reduce((sum, item) => sum + item.quantity, 0);
    
  const fiberglass = summaryItems
    .filter(item => item.type.startsWith('G'))
    .reduce((sum, item) => sum + item.quantity, 0);
    
  const pleated = summaryItems
    .filter(item => item.type.startsWith('P'))
    .reduce((sum, item) => sum + item.quantity, 0);
  
  if (polyesters > 0) {
    packagingUnits['poly'] = { 
      label: 'Polyester Filters', 
      count: Math.ceil(polyesters / 50), 
      unit: 'bags'
    };
  }
  
  if (fiberglass > 0) {
    packagingUnits['fiber'] = { 
      label: 'Fiberglass Filters', 
      count: Math.ceil(fiberglass / 50), 
      unit: 'boxes'
    };
  }
  
  if (pleated > 0) {
    packagingUnits['pleated'] = { 
      label: 'Pleated Filters', 
      count: Math.ceil(pleated / 50), 
      unit: 'bundles'
    };
  }
  
  return packagingUnits;
};
