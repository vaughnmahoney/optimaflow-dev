export interface WorkOrderLocation {
  name?: string;
  locationName?: string;
  address?: string;
  locationNo?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface WorkOrder {
  id: string;
  order_no: string;
  qc_status?: string;
  location?: WorkOrderLocation;
  address?: string;
  service_date?: string;
  lastServiceDate?: string;
  driver?: { 
    name: string;
    externalId?: string;
    serial?: string;
  };
  driverName?: string;
  completion_data?: {
    data?: {
      startTime?: { 
        localTime: string;
        unixTimestamp: number;
        utcTime: string;
      };
      endTime?: { 
        localTime: string;
        unixTimestamp: number;
        utcTime: string;
      };
      status?: string;
      form?: { 
        note?: string;
        images?: Array<{
          type: string;
          url: string;
        }>;
        signature?: {
          type: string;
          url: string;
        };
      };
      tracking_url?: string;
    };
  };
  status?: string;
  service_notes?: string;
  description?: string;
  custom_fields?: {
    field1?: string;
    field2?: string;
    field3?: string;
    field4?: string;
    field5?: string;
  };
  priority?: string;
  search_response?: any;
  completion_response?: any;
}

export interface HeaderProps {
  orderNo: string;
  onClose: () => void;
}

export interface StatusSectionProps {
  status: string | undefined;
}

export interface LocationDetailsProps {
  location: WorkOrder['location'];
  address?: string;
}

export interface ServiceDetailsProps {
  workOrder: WorkOrder;
}

export interface NotesProps {
  workOrder: WorkOrder;
}

export interface ActionButtonsProps {
  onStatusUpdate: (status: string) => void;
  onDownloadAll: () => void;
}
