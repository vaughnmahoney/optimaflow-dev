
import { create } from 'zustand';

// Define types for material items
export interface MaterialItem {
  id: string;
  type: string;
  size: string;
  quantity: number;
  driverName?: string;
}

interface MRState {
  materialsData: MaterialItem[];
  rawNotes: string[];
  technicians: string[];
  setMaterialsData: (data: MaterialItem[]) => void;
  setRawNotes: (notes: string[]) => void;
  setTechnicians: (techs: string[]) => void;
  clearData: () => void;
}

export const useMRStore = create<MRState>((set) => ({
  materialsData: [],
  rawNotes: [],
  technicians: [],
  setMaterialsData: (data) => set({ materialsData: data }),
  setRawNotes: (notes) => set({ rawNotes: notes }),
  setTechnicians: (techs) => set({ technicians: techs }),
  clearData: () => set({ materialsData: [], rawNotes: [], technicians: [] })
}));
