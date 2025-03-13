
import { supabase } from "@/integrations/supabase/client";
import { OrderDetail } from "@/components/materials/types";

/**
 * Fetches order details for a specific order from OptimoRoute
 */
export const getOrderDetail = async (orderNo: string): Promise<{
  data: OrderDetail | null;
  error: string | null;
}> => {
  try {
    console.log(`Fetching details for order: ${orderNo}`);

    // Call the Supabase edge function to fetch order details
    const { data, error } = await supabase.functions.invoke("get-optimoroute-order", {
      body: { orderNo }
    });

    if (error) {
      console.error("Error fetching order details:", error);
      return { data: null, error: error.message };
    }

    if (!data || !data.data) {
      console.error("Invalid response format:", data);
      return { data: null, error: "Invalid response format from API" };
    }

    return { data: data as OrderDetail, error: null };
  } catch (error) {
    console.error("Exception fetching order details:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Batch fetches order details for multiple orders
 */
export const getBatchOrderDetails = async (orderNos: string[]): Promise<{
  data: Record<string, OrderDetail> | null;
  error: string | null;
}> => {
  try {
    if (orderNos.length === 0) {
      return { data: {}, error: null };
    }

    console.log(`Batch fetching details for ${orderNos.length} orders`);

    // Call the Supabase edge function to fetch multiple order details
    const { data, error } = await supabase.functions.invoke("get-optimoroute-orders-batch", {
      body: { orderNos }
    });

    if (error) {
      console.error("Error batch fetching order details:", error);
      return { data: null, error: error.message };
    }

    if (!data || !data.orders) {
      console.error("Invalid response format:", data);
      return { data: null, error: "Invalid response format from API" };
    }

    // Transform list into a record keyed by orderNo
    const orderDetailsMap: Record<string, OrderDetail> = {};
    
    data.orders.forEach((order: OrderDetail) => {
      if (order.data && order.data.orderNo) {
        orderDetailsMap[order.data.orderNo] = order;
      }
    });

    return { data: orderDetailsMap, error: null };
  } catch (error) {
    console.error("Exception batch fetching order details:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
