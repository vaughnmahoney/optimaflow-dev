
import { create } from 'zustand';

// Define types for material items
export interface MaterialItem {
  id: string;
  type: string;
  quantity: number;
  workOrderId?: string;
  driverSerial?: string; // Add driver information
}

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
  
  setMaterialsData: (data) => set({ materialsData: data }),
  
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
  
  // Get materials for a specific driver
  getMaterialsForDriver: (driverSerial) => {
    const { materialsData } = get();
    return materialsData.filter(item => item.driverSerial === driverSerial);
  },
  
  // Calculate total materials count for all selected drivers
  getTotalMaterialsCount: () => {
    const { materialsData, selectedDrivers } = get();
    
    // Filter materials by selected drivers if any are selected
    const filteredMaterials = selectedDrivers.length > 0
      ? materialsData.filter(item => 
          item.driverSerial ? selectedDrivers.includes(item.driverSerial) : false
        )
      : materialsData;
    
    // Aggregate materials by type
    return filteredMaterials.reduce((acc, item) => {
      const { type, quantity } = item;
      acc[type] = (acc[type] || 0) + quantity;
      return acc;
    }, {} as Record<string, number>);
  }
}));
