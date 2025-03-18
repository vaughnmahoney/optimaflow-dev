
import { supabase } from "@/integrations/supabase/client";

export interface GetRoutesParams {
  date: string;
  driverSerial?: string;
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
    const { date, driverSerial } = params;
    
    if (!date) {
      return { success: false, error: "Date is required" };
    }
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('get-optimoroute-routes', {
      body: {
        date,
        driverSerial
      }
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
