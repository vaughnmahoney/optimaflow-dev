
import { create } from 'zustand';

interface MRState {
  materialsData: any[];
  technicians: string[];
  setMaterialsData: (data: any[]) => void;
  setTechnicians: (techs: string[]) => void;
  clearData: () => void;
}

export const useMRStore = create<MRState>((set) => ({
  materialsData: [],
  technicians: [],
  setMaterialsData: (data) => set({ materialsData: data }),
  setTechnicians: (techs) => set({ technicians: techs }),
  clearData: () => set({ materialsData: [], technicians: [] })
}));
