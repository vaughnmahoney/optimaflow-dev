
import { create } from 'zustand';

// Define types for material items
export interface MaterialItem {
  id: string;
  type: string;
  quantity: number;
  workOrderId?: string;
}

interface MRState {
  materialsData: MaterialItem[];
  rawNotes: string[];
  technicianName: string;
  setMaterialsData: (data: MaterialItem[]) => void;
  setRawNotes: (notes: string[]) => void;
  setTechnicianName: (name: string) => void;
  clearData: () => void;
}

export const useMRStore = create<MRState>((set) => ({
  materialsData: [],
  rawNotes: [],
  technicianName: 'Technician',
  setMaterialsData: (data) => set({ materialsData: data }),
  setRawNotes: (notes) => set({ rawNotes: notes }),
  setTechnicianName: (name) => set({ technicianName: name }),
  clearData: () => set({ materialsData: [], rawNotes: [], technicianName: 'Technician' })
}));
