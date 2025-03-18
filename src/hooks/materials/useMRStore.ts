
import { create } from 'zustand';

// Define types for material items
export interface MaterialItem {
  id: string;
  type: string;
  quantity: number;
  workOrderId?: string;
  driverSerial?: string; // Driver identifier for material assignment
}

// Helper function to determine if an ID is a fallback ID
const isFallbackDriverId = (id: string): boolean => {
  return id.startsWith('driver_');
};

// Enhanced state to handle multiple drivers
interface MRState {
  materialsData: MaterialItem[];
  rawNotes: string[];
  technicianName: string;
  selectedDrivers: string[];
  setMaterialsData: (data: MaterialItem[]) => void;
  setRawNotes: (notes: string[]) => void;
  setTechnicianName: (name: string) => void;
  setSelectedDrivers: (drivers: string[]) => void;
  addSelectedDriver: (driverSerial: string) => void;
  removeSelectedDriver: (driverSerial: string) => void;
  clearSelectedDrivers: () => void;
  clearData: () => void;
  getMaterialsForDriver: (driverSerial: string) => MaterialItem[];
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
      const driverSerial = item.driverSerial || 'unknown';
      if (!acc[driverSerial]) acc[driverSerial] = [];
      acc[driverSerial].push(item);
      return acc;
    }, {} as Record<string, MaterialItem[]>);
    
    console.log('[DEBUG-STORE] Materials by driver:');
    Object.entries(materialsByDriver).forEach(([driver, items]) => {
      const isFallback = isFallbackDriverId(driver);
      console.log(`[DEBUG-STORE] - Driver ${driver}${isFallback ? ' (fallback ID)' : ''}: ${items.length} items`);
    });
    
    set({ materialsData: data });
  },
  
  setRawNotes: (notes) => set({ rawNotes: notes }),
  
  setTechnicianName: (name) => set({ technicianName: name }),
  
  setSelectedDrivers: (drivers) => set({ selectedDrivers: drivers }),
  
  addSelectedDriver: (driverSerial) => 
    set(state => ({ 
      selectedDrivers: [...state.selectedDrivers, driverSerial] 
    })),
  
  removeSelectedDriver: (driverSerial) => 
    set(state => ({ 
      selectedDrivers: state.selectedDrivers.filter(d => d !== driverSerial) 
    })),
  
  clearSelectedDrivers: () => set({ selectedDrivers: [] }),
  
  clearData: () => set({ 
    materialsData: [], 
    rawNotes: [], 
    technicianName: 'Technician',
    selectedDrivers: []
  }),
  
  // Get materials for a specific driver - enhanced to handle fallback IDs
  getMaterialsForDriver: (driverSerial) => {
    const { materialsData } = get();
    
    // Check if this is a fallback ID
    const isFallback = isFallbackDriverId(driverSerial);
    
    // Only include materials that have a matching driverSerial (strict equality)
    const materials = materialsData.filter(item => {
      // Skip items with no driver assigned
      if (!item.driverSerial) return false;
      
      // Direct match
      if (item.driverSerial === driverSerial) return true;
      
      // No match, and not checking fallbacks
      return false;
    });
    
    console.log(`[DEBUG-STORE] Getting materials for driver ${driverSerial}${isFallback ? ' (fallback ID)' : ''}: ${materials.length} items`);
    
    // Additional verification that all returned materials have the right driver
    const incorrectlyAssigned = materials.filter(m => m.driverSerial !== driverSerial);
    if (incorrectlyAssigned.length > 0) {
      console.error(`[DEBUG-STORE] ⚠️ Found ${incorrectlyAssigned.length} materials incorrectly assigned!`);
    }
    
    return materials;
  },
  
  // Calculate total materials count for all selected drivers
  getTotalMaterialsCount: () => {
    const { materialsData, selectedDrivers } = get();
    
    console.log(`[DEBUG-STORE] Calculating total materials with ${selectedDrivers.length} selected drivers`);
    
    // Filter materials by selected drivers if any are selected
    const filteredMaterials = selectedDrivers.length > 0
      ? materialsData.filter(item => 
          item.driverSerial ? selectedDrivers.includes(item.driverSerial) : false
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
