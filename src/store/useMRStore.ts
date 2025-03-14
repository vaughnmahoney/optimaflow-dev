
import { create } from 'zustand';
import { Driver, MaterialSummary, MaterialType } from '@/types/material-requirements';

interface MRState {
  isLoading: boolean;
  error: string | null;
  drivers: Driver[];
  selectedDrivers: string[];
  selectedWorkOrders: string[];
  summary: MaterialSummary;
  selectedDriver: Driver | null;
  
  setDrivers: (drivers: Driver[]) => void;
  toggleDriverSelection: (driverId: string) => void;
  selectAllDrivers: (selected: boolean) => void;
  toggleWorkOrderSelection: (workOrderId: string) => void;
  calculateSummary: () => void;
  setSelectedDriver: (driverId: string | null) => void;
  clearAll: () => void;
}

export const useMRStore = create<MRState>((set, get) => ({
  isLoading: false,
  error: null,
  drivers: [],
  selectedDrivers: [],
  selectedWorkOrders: [],
  selectedDriver: null,
  summary: {
    totalDrivers: 0,
    totalWorkOrders: 0,
    totalFilters: 0,
    totalCoils: 0
  },
  
  setDrivers: (drivers) => set({ drivers }),
  
  toggleDriverSelection: (driverId) => {
    set((state) => {
      const isSelected = state.selectedDrivers.includes(driverId);
      const selectedDrivers = isSelected
        ? state.selectedDrivers.filter(id => id !== driverId)
        : [...state.selectedDrivers, driverId];
        
      return { selectedDrivers };
    });
  },
  
  selectAllDrivers: (selected) => {
    set((state) => {
      if (selected) {
        const allDriverIds = state.drivers.map(driver => driver.id);
        return { selectedDrivers: allDriverIds };
      }
      return { selectedDrivers: [] };
    });
  },
  
  toggleWorkOrderSelection: (workOrderId) => {
    set((state) => {
      const isSelected = state.selectedWorkOrders.includes(workOrderId);
      const selectedWorkOrders = isSelected
        ? state.selectedWorkOrders.filter(id => id !== workOrderId)
        : [...state.selectedWorkOrders, workOrderId];
        
      return { selectedWorkOrders };
    });
  },
  
  calculateSummary: () => {
    const state = get();
    
    // Filter selected work orders
    const workOrders = [];
    state.drivers.forEach(driver => {
      if (state.selectedDrivers.includes(driver.id)) {
        driver.workOrders.forEach(wo => {
          if (state.selectedWorkOrders.includes(wo.id)) {
            workOrders.push(wo);
          }
        });
      }
    });
    
    // Count materials
    let totalFilters = 0;
    let totalCoils = 0;
    
    workOrders.forEach(wo => {
      wo.materials.forEach(material => {
        if (material.type === MaterialType.Filter) {
          totalFilters += material.quantity;
        } else if (material.type === MaterialType.Coil) {
          totalCoils += material.quantity;
        }
      });
    });
    
    set({
      summary: {
        totalDrivers: state.selectedDrivers.length,
        totalWorkOrders: workOrders.length,
        totalFilters,
        totalCoils
      }
    });
  },
  
  setSelectedDriver: (driverId) => {
    set((state) => {
      if (!driverId) {
        return { selectedDriver: null };
      }
      
      const driver = state.drivers.find(d => d.id === driverId) || null;
      return { selectedDriver: driver };
    });
  },
  
  clearAll: () => set({
    selectedDrivers: [],
    selectedWorkOrders: [],
    selectedDriver: null,
    summary: {
      totalDrivers: 0,
      totalWorkOrders: 0,
      totalFilters: 0,
      totalCoils: 0
    }
  })
}));
