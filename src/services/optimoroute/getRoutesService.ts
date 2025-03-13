
import { supabase } from "@/integrations/supabase/client";

export interface GetRoutesParams {
  date: string;
  driverSerial?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface RouteStop {
  stopNumber: number;
  orderNo: string;
  scheduledAt: string;
  address: string;
  locationName: string;
  latitude: number;
  longitude: number;
}

export interface DriverRoute {
  driverSerial: string;
  driverName: string;
  vehicleRegistration: string;
  duration: number;
  distance: number;
  stops: RouteStop[];
}

export interface GetRoutesResponse {
  success: boolean;
  error?: string;
  routes?: DriverRoute[];
}

export const getRoutes = async (params: GetRoutesParams): Promise<GetRoutesResponse> => {
  try {
    const { date, driverSerial, dateRange } = params;
    
    if (!date && !dateRange) {
      return { success: false, error: "Either date or dateRange is required" };
    }
    
    // Prepare the request body
    const requestBody: any = {
      driverSerial
    };
    
    // Use dateRange if provided, otherwise use single date
    if (dateRange) {
      requestBody.dateRange = dateRange;
    } else {
      requestBody.date = date;
    }
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('get-optimoroute-routes', {
      body: requestBody
    });
    
    if (error) {
      console.error("Error fetching routes:", error);
      return { success: false, error: error.message };
    }
    
    return data;
  } catch (error) {
    console.error("Exception in getRoutes:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
