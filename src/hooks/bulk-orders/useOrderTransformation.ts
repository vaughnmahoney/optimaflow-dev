
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
        
        // Extract driver information and name
        const driverName = 
          // First try the driver_name field if exists
          order.driver_name ||
          // Then try the driver object
          (order.driver?.name) || 
          // Then try scheduleInformation
          (order.scheduleInformation && order.scheduleInformation.driverName) ||
          // Then look in searchResponse
          (order.searchResponse?.scheduleInformation?.driverName) ||
          (order.searchResponse?.data?.driver?.name) ||
          "Unknown Driver";
        
        // Extract location information and name
        const locationName = 
          // First try the location_name field if exists
          order.location_name ||
          // Then try location object's name
          (order.location?.name) ||
          (order.location?.locationName) ||
          // Then search in search response
          (order.searchResponse?.data?.location?.name) ||
          (order.searchResponse?.data?.location?.locationName) ||
          "Unknown Location";
        
        // Build location object
        const location = order.location || 
                        (order.searchResponse && order.searchResponse.data && order.searchResponse.data.location) ||
                        { name: locationName };
        
        // Determine status - default to pending_review for new imports
        const status = order.status || 
                      order.completion_status ||
                      (order.completionDetails?.data?.status) || 
                      "pending_review";
                      
        // Extract end time
        const endTime = extractEndTime(order);
        
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
          end_time: endTime,
          service_notes: order.service_notes || "",
          notes: order.notes || "",
          location: location,
          location_name: locationName,
          driver: { name: driverName },
          driver_name: driverName,
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

  // Helper function to extract end time
  const extractEndTime = (order: any): string | null => {
    // Try different paths to find the end time
    if (order.end_time) {
      return order.end_time;
    }
    
    // Try completion response endTime
    if (order.completionDetails?.data?.endTime?.utcTime) {
      return order.completionDetails.data.endTime.utcTime;
    }
    
    if (order.completionDetails?.data?.endTime?.localTime) {
      return order.completionDetails.data.endTime.localTime;
    }
    
    // Try completion_response in array format
    if (order.completion_response?.orders?.[0]?.data?.endTime?.utcTime) {
      return order.completion_response.orders[0].data.endTime.utcTime;
    }
    
    if (order.completion_response?.orders?.[0]?.data?.endTime?.localTime) {
      return order.completion_response.orders[0].data.endTime.localTime;
    }
    
    // Fallback to service_date if available
    if (order.service_date) {
      return order.service_date;
    }
    
    return null;
  };

  return {
    workOrders,
    setWorkOrders
  };
};
