
import { create } from 'zustand';
import { Driver, MaterialSummary, MRState, WorkOrder } from '@/types/material-requirements';

const initialSummary: MaterialSummary = {
  totalFilters: 0,
  totalCoils: 0,
  totalDrivers: 0,
  totalWorkOrders: 0
};

export const useMRStore = create<MRState & {
  setDrivers: (drivers: Driver[]) => void;
  toggleDriverSelection: (driverId: string) => void;
  toggleWorkOrderSelection: (workOrderId: string) => void;
  selectAllDrivers: (selected: boolean) => void;
  selectAllWorkOrders: (driverId: string, selected: boolean) => void;
  setImportDate: (date: Date | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  calculateSummary: () => void;
  reset: () => void;
}>((set, get) => ({
  drivers: [],
  selectedDrivers: [],
  selectedWorkOrders: [],
  selectedDriver: null,
  importDate: null,
  isLoading: false,
  error: null,
  summary: initialSummary,

  setDrivers: (drivers) => set({ drivers }),
  
  toggleDriverSelection: (driverId) => set((state) => {
    const isSelected = state.selectedDrivers.includes(driverId);
    const newSelectedDrivers = isSelected
      ? state.selectedDrivers.filter(id => id !== driverId)
      : [...state.selectedDrivers, driverId];
    
    // If deselecting a driver, also remove all of its work orders from selection
    const driver = state.drivers.find(d => d.id === driverId);
    let newSelectedWorkOrders = [...state.selectedWorkOrders];
    
    if (isSelected && driver) {
      newSelectedWorkOrders = newSelectedWorkOrders.filter(
        woId => !driver.workOrders.some(wo => wo.id === woId)
      );
    }
    
    // Update selectedDriver when selecting/deselecting
    const newSelectedDriver = isSelected ? null : driver || null;
    
    return { 
      selectedDrivers: newSelectedDrivers,
      selectedWorkOrders: newSelectedWorkOrders,
      selectedDriver: newSelectedDriver
    };
  }),
  
  toggleWorkOrderSelection: (workOrderId) => set((state) => {
    const isSelected = state.selectedWorkOrders.includes(workOrderId);
    const newSelectedWorkOrders = isSelected
      ? state.selectedWorkOrders.filter(id => id !== workOrderId)
      : [...state.selectedWorkOrders, workOrderId];
    
    return { selectedWorkOrders: newSelectedWorkOrders };
  }),
  
  selectAllDrivers: (selected) => set((state) => {
    if (selected) {
      const allDriverIds = state.drivers.map(driver => driver.id);
      const allWorkOrderIds = state.drivers.flatMap(driver => 
        driver.workOrders.map(wo => wo.id)
      );
      return { 
        selectedDrivers: allDriverIds,
        selectedWorkOrders: allWorkOrderIds,
        selectedDriver: state.drivers[0] || null
      };
    }
    return { 
      selectedDrivers: [],
      selectedWorkOrders: [],
      selectedDriver: null
    };
  }),
  
  selectAllWorkOrders: (driverId, selected) => set((state) => {
    const driver = state.drivers.find(d => d.id === driverId);
    if (!driver) return state;
    
    const driverWorkOrderIds = driver.workOrders.map(wo => wo.id);
    let newSelectedWorkOrders = [...state.selectedWorkOrders];
    
    if (selected) {
      // Add work orders that aren't already selected
      driverWorkOrderIds.forEach(woId => {
        if (!newSelectedWorkOrders.includes(woId)) {
          newSelectedWorkOrders.push(woId);
        }
      });
      
      // Make sure driver is selected
      let newSelectedDrivers = state.selectedDrivers.includes(driverId)
        ? state.selectedDrivers
        : [...state.selectedDrivers, driverId];
        
      return { 
        selectedWorkOrders: newSelectedWorkOrders,
        selectedDrivers: newSelectedDrivers,
        selectedDriver: driver
      };
    } else {
      // Remove all of this driver's work orders from selection
      newSelectedWorkOrders = newSelectedWorkOrders.filter(
        woId => !driverWorkOrderIds.includes(woId)
      );
      
      return { selectedWorkOrders: newSelectedWorkOrders };
    }
  }),
  
  setImportDate: (date) => set({ importDate: date }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  calculateSummary: () => set((state) => {
    const selectedDriverIds = new Set(state.selectedDrivers);
    const selectedWorkOrderIds = new Set(state.selectedWorkOrders);
    
    let totalFilters = 0;
    let totalCoils = 0;
    
    state.drivers.forEach(driver => {
      if (selectedDriverIds.has(driver.id)) {
        driver.workOrders.forEach(workOrder => {
          if (selectedWorkOrderIds.has(workOrder.id)) {
            workOrder.materials.forEach(material => {
              if (material.type === 'filter') {
                totalFilters += material.quantity;
              } else if (material.type === 'coil') {
                totalCoils += material.quantity;
              }
            });
          }
        });
      }
    });
    
    const summary: MaterialSummary = {
      totalFilters,
      totalCoils,
      totalDrivers: state.selectedDrivers.length,
      totalWorkOrders: state.selectedWorkOrders.length
    };
    
    return { summary };
  }),
  
  reset: () => set({
    selectedDrivers: [],
    selectedWorkOrders: [],
    selectedDriver: null,
    importDate: null,
    error: null,
    summary: initialSummary
  })
}));
