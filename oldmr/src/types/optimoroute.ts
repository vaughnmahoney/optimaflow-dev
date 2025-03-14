
export interface FormattedOrder {
  id: string;
  orderNo: string;
  date: string;
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  status: string;
  completionTime?: string;
  notes: string;
  customFields: {
    groundUnits?: string;
    deliveryDate?: string;
    [key: string]: string | undefined;
  };
  photos?: string[];
  signatures?: string[];
  driverNotes?: string;
}
