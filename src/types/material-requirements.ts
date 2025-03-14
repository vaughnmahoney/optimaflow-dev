
export interface Driver {
  id: string;
  name: string;
  selected?: boolean;
  workOrders: WorkOrder[];
}

export interface WorkOrder {
  id: string;
  orderId: string;
  locationName: string;
  address: string;
  date: string;
  materials: Material[];
  selected?: boolean;
}

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  size?: string;
  quantity: number;
  unit: string;
  locations?: Set<string>;
}

export enum MaterialType {
  Filter = "filter",
  Coil = "coil",
  Supplies = "supplies",
  Tool = "tool"
}

export interface MaterialSummary {
  totalFilters: number;
  totalCoils: number;
  totalDrivers: number;
  totalWorkOrders: number;
}

export interface MRState {
  drivers: Driver[];
  selectedDrivers: string[];
  selectedWorkOrders: string[];
  selectedDriver: Driver | null;
  importDate: Date | null;
  isLoading: boolean;
  error: string | null;
  summary: MaterialSummary;
}
