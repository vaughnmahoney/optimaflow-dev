
import { supabase } from "@/integrations/supabase/client";

export interface OrderDetail {
  id: string;
  data: {
    orderNo: string;
    date: string;
    notes: string;
    [key: string]: any;
  };
}

export interface OrderDetailsResponse {
  success: boolean;
  error?: string;
  orders?: OrderDetail[];
}

export const getOrderDetails = async (orderNumbers: string[]): Promise<OrderDetailsResponse> => {
  try {
    if (!orderNumbers.length) {
      return { success: false, error: "No order numbers provided" };
    }
    
    // Call the Supabase Edge Function to get order details
    const { data, error } = await supabase.functions.invoke('search-optimoroute', {
      body: {
        orderNumbers
      }
    });
    
    if (error) {
      console.error("Error fetching order details:", error);
      return { success: false, error: error.message };
    }
    
    return data;
  } catch (error) {
    console.error("Exception in getOrderDetails:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
