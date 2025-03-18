
import { create } from 'zustand';

// Define types for material items
export interface MaterialItem {
  id: string;
  type: string;
  quantity: number;
  workOrderId?: string;
  driverName?: string; // Changed from driverSerial to driverName
}

interface MRState {
  materialsData: MaterialItem[];
  rawNotes: string[];
  technicianName: string;
  selectedDrivers: string[];
  setMaterialsData: (data: MaterialItem[]) => void;
  setRawNotes: (notes: string[]) => void;
  setTechnicianName: (name: string) => void;
  setSelectedDrivers: (drivers: string[]) => void;
  addSelectedDriver: (driverName: string) => void;
  removeSelectedDriver: (driverName: string) => void;
  clearSelectedDrivers: () => void;
  clearData: () => void;
  getMaterialsForDriver: (driverName: string) => MaterialItem[];
  getTotalMaterialsCount: () => Record<string, number>;
}

export const useMRStore = create<MRState>((set, get) => ({
  materialsData: [],
  rawNotes: [],
  technicianName: 'Technician',
  selectedDrivers: [],
  
  setMaterialsData: (data) => {
    console.log(`[DEBUG-STORE] Setting materials data: ${data.length} items`);
    
    // Check for any patterns or anomalies in the data
    const materialsByDriver = data.reduce((acc, item) => {
      const driverName = item.driverName || 'unknown';
      if (!acc[driverName]) acc[driverName] = [];
      acc[driverName].push(item);
      return acc;
    }, {} as Record<string, MaterialItem[]>);
    
    console.log('[DEBUG-STORE] Materials by driver:');
    Object.entries(materialsByDriver).forEach(([driver, items]) => {
      console.log(`[DEBUG-STORE] - Driver ${driver}: ${items.length} items`);
    });
    
    set({ materialsData: data });
  },
  
  setRawNotes: (notes) => set({ rawNotes: notes }),
  
  setTechnicianName: (name) => set({ technicianName: name }),
  
  setSelectedDrivers: (drivers) => set({ selectedDrivers: drivers }),
  
  addSelectedDriver: (driverName) => 
    set(state => ({ 
      selectedDrivers: [...state.selectedDrivers, driverName] 
    })),
  
  removeSelectedDriver: (driverName) => 
    set(state => ({ 
      selectedDrivers: state.selectedDrivers.filter(d => d !== driverName) 
    })),
  
  clearSelectedDrivers: () => set({ selectedDrivers: [] }),
  
  clearData: () => set({ 
    materialsData: [], 
    rawNotes: [], 
    technicianName: 'Technician',
    selectedDrivers: []
  }),
  
  // Get materials for a specific driver by name
  getMaterialsForDriver: (driverName) => {
    const { materialsData } = get();
    
    // Only include materials that have a matching driverName
    const materials = materialsData.filter(item => {
      // Skip items with no driver assigned
      if (!item.driverName) return false;
      
      // Match by driver name
      return item.driverName === driverName;
    });
    
    console.log(`[DEBUG-STORE] Getting materials for driver ${driverName}: ${materials.length} items`);
    
    return materials;
  },
  
  // Calculate total materials count for all selected drivers
  getTotalMaterialsCount: () => {
    const { materialsData, selectedDrivers } = get();
    
    console.log(`[DEBUG-STORE] Calculating total materials with ${selectedDrivers.length} selected drivers`);
    
    // Filter materials by selected drivers if any are selected
    const filteredMaterials = selectedDrivers.length > 0
      ? materialsData.filter(item => 
          item.driverName ? selectedDrivers.includes(item.driverName) : false
        )
      : materialsData;
    
    console.log(`[DEBUG-STORE] Filtered to ${filteredMaterials.length} materials`);
    
    // Aggregate materials by type
    const result = filteredMaterials.reduce((acc, item) => {
      const { type, quantity } = item;
      acc[type] = (acc[type] || 0) + quantity;
      return acc;
    }, {} as Record<string, number>);
    
    // Log the results for debugging
    console.log('[DEBUG-STORE] Material counts by type:');
    Object.entries(result).forEach(([type, count]) => {
      if (count > 1000) {
        console.log(`[DEBUG-STORE] ⚠️ ANOMALY: ${type} = ${count}`);
      } else {
        console.log(`[DEBUG-STORE] ${type} = ${count}`);
      }
    });
    
    return result;
  }
}));
