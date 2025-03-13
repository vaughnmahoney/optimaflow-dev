
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { DriverRoute } from "@/components/materials/types";

/**
 * Fetches routes for a specific date from OptimoRoute
 */
export const getRoutes = async (date: Date): Promise<{
  data: DriverRoute[] | null;
  error: string | null;
}> => {
  try {
    // Format date as YYYY-MM-DD for API
    const formattedDate = format(date, "yyyy-MM-dd");
    console.log(`Fetching routes for date: ${formattedDate}`);

    // Call the Supabase edge function to fetch routes
    const { data, error } = await supabase.functions.invoke("get-optimoroute-routes", {
      body: { date: formattedDate }
    });

    if (error) {
      console.error("Error fetching routes:", error);
      return { data: null, error: error.message };
    }

    if (!data || !Array.isArray(data.routes)) {
      console.error("Invalid response format:", data);
      return { data: null, error: "Invalid response format from API" };
    }

    // Transform the API response to our DriverRoute format
    const transformedRoutes: DriverRoute[] = data.routes.map((route: any) => ({
      driverSerial: route.driverSerial || route.driverId || `driver-${Math.random().toString(36).substring(7)}`,
      driverName: route.driverName || "Unknown Driver",
      stops: (route.stops || []).map((stop: any) => ({
        orderNo: stop.orderNo || stop.orderId || "",
        location: stop.location || "",
        storeName: stop.storeName || stop.location || "",
        storeId: stop.storeId || ""
      })),
      totalStops: (route.stops || []).length
    }));

    return { data: transformedRoutes, error: null };
  } catch (error) {
    console.error("Exception fetching routes:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
