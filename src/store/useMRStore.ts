
import { create } from 'zustand';
import { MaterialItem, DriverRoute, MRStats } from '@/components/materials/types';

interface MRState {
  // Data
  materialItems: MaterialItem[];
  drivers: DriverRoute[];
  rawNotes: Record<string, string>;
  selectedDrivers: string[];
  dateSelected: Date | null;
  materialStats: MRStats;
  
  // Actions
  setMaterialItems: (items: MaterialItem[]) => void;
  addMaterialItems: (items: MaterialItem[]) => void;
  setDrivers: (drivers: DriverRoute[]) => void;
  setRawNotes: (notes: Record<string, string>) => void;
  setDateSelected: (date: Date | null) => void;
  toggleDriverSelection: (driverSerial: string) => void;
  toggleDriverExpanded: (driverSerial: string) => void;
  selectAllDrivers: (selected: boolean) => void;
  clearAll: () => void;
  setMaterialStats: (stats: MRStats) => void;
  updateMaterialStats: () => void;
}

export const useMRStore = create<MRState>((set, get) => ({
  // Initial state
  materialItems: [],
  drivers: [],
  rawNotes: {},
  selectedDrivers: [],
  dateSelected: null,
  materialStats: {
    totalWorkOrders: 0,
    totalTechnicians: 0,
    totalFilters: 0
  },
  
  // Actions
  setMaterialItems: (items) => set({ materialItems: items }),
  
  addMaterialItems: (items) => set((state) => ({
    materialItems: [...state.materialItems, ...items]
  })),
  
  setDrivers: (drivers) => set({ 
    drivers: drivers.map(driver => ({
      ...driver,
      expanded: false,
      selected: false
    }))
  }),
  
  setRawNotes: (notes) => set({ rawNotes: notes }),
  
  setDateSelected: (date) => set({ dateSelected: date }),
  
  toggleDriverSelection: (driverSerial) => set((state) => {
    const updatedDrivers = state.drivers.map(driver => 
      driver.driverSerial === driverSerial
        ? { ...driver, selected: !driver.selected }
        : driver
    );
    
    const updatedSelectedDrivers = updatedDrivers
      .filter(driver => driver.selected)
      .map(driver => driver.driverSerial);
    
    return {
      drivers: updatedDrivers,
      selectedDrivers: updatedSelectedDrivers
    };
  }),
  
  toggleDriverExpanded: (driverSerial) => set((state) => ({
    drivers: state.drivers.map(driver => 
      driver.driverSerial === driverSerial
        ? { ...driver, expanded: !driver.expanded }
        : driver
    )
  })),
  
  selectAllDrivers: (selected) => set((state) => {
    const updatedDrivers = state.drivers.map(driver => ({
      ...driver,
      selected
    }));
    
    const updatedSelectedDrivers = selected 
      ? updatedDrivers.map(driver => driver.driverSerial) 
      : [];
    
    return {
      drivers: updatedDrivers,
      selectedDrivers: updatedSelectedDrivers
    };
  }),
  
  clearAll: () => set({
    materialItems: [],
    drivers: [],
    rawNotes: {},
    selectedDrivers: [],
    dateSelected: null,
    materialStats: {
      totalWorkOrders: 0,
      totalTechnicians: 0,
      totalFilters: 0
    }
  }),
  
  setMaterialStats: (stats) => set({ materialStats: stats }),
  
  updateMaterialStats: () => set((state) => {
    const totalWorkOrders = new Set(
      state.materialItems.map(item => item.workOrderId)
    ).size;
    
    const totalTechnicians = state.drivers.length;
    
    const totalFilters = state.materialItems.reduce(
      (sum, item) => sum + item.quantity, 0
    );
    
    return {
      materialStats: {
        totalWorkOrders,
        totalTechnicians,
        totalFilters
      }
    };
  })
}));
