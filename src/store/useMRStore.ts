
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { MaterialType } from '@/types/material-requirements';

// Define types for material items
export interface MaterialItem {
  id: string;
  type: string;
  quantity: number;
  workOrderId?: string;
  driverSerial?: string;
}

// Enhanced state to handle multiple drivers
interface MRState {
  materialsData: MaterialItem[];
  rawNotes: string[];
  technicianName: string;
  selectedDrivers: string[];
  selectedDriver: any;
  drivers: any[];
  isLoading: boolean;
  importDate: Date | null;
  error: string | null;
  summary: {
    totalFilters: number;
    totalCoils: number;
    totalDrivers: number;
    totalWorkOrders: number;
  };
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
  setSelectedDriver: (driver: any) => void;
  setDrivers: (drivers: any[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  calculateSummary: () => void;
}

export const useMRStore = create<MRState>((set, get) => ({
  materialsData: [],
  rawNotes: [],
  technicianName: 'Technician',
  selectedDrivers: [],
  selectedDriver: null,
  drivers: [],
  isLoading: false,
  importDate: null,
  error: null,
  summary: {
    totalFilters: 0,
    totalCoils: 0,
    totalDrivers: 0,
    totalWorkOrders: 0
  },
  
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
    selectedDrivers: [],
    selectedDriver: null,
    drivers: [],
    importDate: null,
    error: null
  }),
  
  getMaterialsForDriver: (driverSerial) => {
    const { materialsData } = get();
    return materialsData.filter(item => item.driverSerial === driverSerial);
  },
  
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
  },

  setSelectedDriver: (driver) => set({ selectedDriver: driver }),
  
  setDrivers: (drivers) => set({ drivers }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  calculateSummary: () => {
    const { materialsData, selectedDrivers, drivers } = get();
    
    // Get all unique work order IDs
    const workOrderIds = new Set<string>();
    materialsData.forEach(item => {
      if (item.workOrderId) {
        workOrderIds.add(item.workOrderId);
      }
    });
    
    // Count filters and coils
    let totalFilters = 0;
    let totalCoils = 0;
    
    materialsData.forEach(item => {
      // Simple detection based on item type name
      if (item.type.includes('COOLER') || item.type.includes('FREEZER') || 
          item.type.includes('CONDCOIL') || item.type.includes('PRODUCE')) {
        totalCoils += item.quantity;
      } else {
        totalFilters += item.quantity;
      }
    });
    
    set({
      summary: {
        totalFilters,
        totalCoils,
        totalDrivers: selectedDrivers.length || drivers.length,
        totalWorkOrders: workOrderIds.size
      }
    });
  }
}));
