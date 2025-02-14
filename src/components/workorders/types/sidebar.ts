
export interface WorkOrder {
  order_no: string;
  qc_status?: string;
  location?: {
    name?: string;
    locationName?: string;
    address?: string;
  } | string;
  address?: string;
  service_date?: string;
  lastServiceDate?: string;
  driver?: { name: string };
  driverName?: string;
  completion_data?: {
    data?: {
      startTime?: { localTime: string };
      endTime?: { localTime: string };
      assignedTo?: { name: string };
      status?: string;
      form?: { note?: string };
    };
  };
  completion_response?: {
    timeOnSite?: string;
    notes?: string;
    proofOfDelivery?: {
      timestamp?: string;
      notes?: string;
    };
  };
  status?: string;
  service_notes?: string;
  serviceNotes?: string;
  description?: string;
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
