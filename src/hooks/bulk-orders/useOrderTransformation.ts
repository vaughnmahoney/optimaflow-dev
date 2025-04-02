
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
        
        // Extract driver information - directly storing driver_name for sorting/filtering
        let driverName = '';
        let driverObject = null;
        
        if (order.driver && typeof order.driver === 'object') {
          driverObject = order.driver;
          driverName = order.driver.name || '';
        } else if (order.scheduleInformation && order.scheduleInformation.driverName) {
          driverName = order.scheduleInformation.driverName;
          driverObject = { name: driverName };
        } else if (order.searchResponse?.scheduleInformation?.driverName) {
          driverName = order.searchResponse.scheduleInformation.driverName;
          driverObject = { name: driverName };
        } else {
          driverName = "Unknown Driver";
          driverObject = { name: driverName };
        }
        
        // Extract location information - directly storing location_name for sorting/filtering
        let locationName = 'N/A';
        let locationObj: any = {};
        
        if (order.location && typeof order.location === 'object') {
          locationObj = order.location;
          locationName = order.location.name || order.location.locationName || 'N/A';
        } else if (order.searchResponse?.data?.location) {
          const locData = order.searchResponse.data.location;
          if (typeof locData === 'object') {
            locationObj = locData;
            locationName = locData.name || locData.locationName || 'N/A';
          } else {
            locationName = String(locData);
          }
        }
        
        // Extract end_time for completion
        let endTime = null;
        if (order.completionDetails?.data?.endTime?.utcTime) {
          endTime = order.completionDetails.data.endTime.utcTime;
        } else if (order.completion_response?.orders?.[0]?.data?.endTime?.utcTime) {
          endTime = order.completion_response.orders[0].data.endTime.utcTime;
        } else if (order.completion_response?.orders?.[0]?.data?.endTime) {
          endTime = order.completion_response.orders[0].data.endTime;
        }
        
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
          location: locationObj,
          driver: driverObject,
          driver_name: driverName,
          location_name: locationName,
          end_time: endTime,
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
