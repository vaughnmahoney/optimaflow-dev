
import { useState, useEffect } from "react";
import { WorkOrder } from "@/components/workorders/types";

/**
 * Hook to transform raw bulk orders into work order format
 */
export const useOrderTransformation = (rawOrders: any[] | null) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  // Transform bulk orders to work order format when rawOrders changes
  useEffect(() => {
    if (rawOrders && rawOrders.length > 0) {
      const transformedOrders: WorkOrder[] = rawOrders.map((order, index) => {
        // Extract order number from different possible locations
        const orderNo = order.data?.orderNo || 
                       order.orderNo || 
                       (order.completionDetails && order.completionDetails.orderNo) ||
                       `BULK-${index}`;
        
        // Extract service date
        const serviceDate = order.data?.date ||
                           order.service_date || 
                           (order.searchResponse && order.searchResponse.data && order.searchResponse.data.date) ||
                           new Date().toISOString();
        
        // Extract driver information
        const driverName = order.driver?.name || 
                          (order.scheduleInformation && order.scheduleInformation.driverName) ||
                          (order.searchResponse?.scheduleInformation?.driverName) ||
                          "Unknown Driver";
        
        // Extract location information
        const location = order.location || 
                        (order.searchResponse && order.searchResponse.data && order.searchResponse.data.location) ||
                        { name: "Unknown Location" };
        
        // Determine status - default to pending_review for new imports
        const status = order.status || 
                      order.completion_status ||
                      (order.completionDetails?.data?.status) || 
                      "pending_review";
                      
        // Get completion response data
        const completionResponse = {
          success: true,
          orders: [{
            id: orderNo,
            data: {
              form: {
                images: order.completionDetails?.data?.form?.images || [],
                note: order.completionDetails?.data?.form?.note || ""
              },
              startTime: order.completionDetails?.data?.startTime,
              endTime: order.completionDetails?.data?.endTime,
              tracking_url: order.completionDetails?.data?.tracking_url
            }
          }]
        };
                      
        // Create a work order object from the bulk order data
        return {
          id: order.id || `bulk-order-${index}`,
          order_no: orderNo,
          status: status,
          timestamp: new Date().toISOString(),
          service_date: serviceDate,
          service_notes: order.service_notes || "",
          notes: order.notes || "",
          location: location,
          driver: { name: driverName },
          has_images: (order.completionDetails?.data?.form?.images?.length || 0) > 0,
          completion_response: completionResponse,
          search_response: order.searchResponse || null
        };
      });
      
      setWorkOrders(transformedOrders);
    } else {
      setWorkOrders([]);
    }
  }, [rawOrders]);

  return {
    workOrders,
    setWorkOrders
  };
};
