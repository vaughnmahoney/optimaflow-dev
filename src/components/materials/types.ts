
export interface MaterialItem {
  id: string;
  type: string;
  quantity: number;
  size?: string;
  workOrderId?: string;
  driverSerial?: string;
  storeId?: string;
  storeName?: string;
}

export interface DriverRoute {
  driverSerial: string;
  driverName: string;
  stops: Array<{
    orderNo: string;
    location?: string;
    storeName?: string;
    storeId?: string;
  }>;
  totalStops: number;
  expanded?: boolean;
  selected?: boolean;
}

export interface OrderDetail {
  data: {
    orderNo: string;
    notes: string;
    location?: string;
  };
}

export interface MaterialSummary {
  type: string;
  size: string;
  quantity: number;
}

export interface MRStats {
  totalWorkOrders: number;
  totalTechnicians: number;
  totalFilters: number;
}
