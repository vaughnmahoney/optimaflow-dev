
import { useState } from "react";
import { useOrdersApi } from "../bulk-orders/useOrdersApi";
import { MaterialItem } from "./useMRStore";

interface MaterialsApiResult {
  materialItems: MaterialItem[];
  noteStrings: string[];
  technicianName: string;
  error: string | null;
}

export const useMaterialsApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { fetchOrders } = useOrdersApi();

  // Extract material items from work order notes
  const extractMaterialsFromOrders = async (
    startDate: Date,
    endDate: Date,
    driverFilter?: string
  ): Promise<MaterialsApiResult> => {
    setIsLoading(true);
    
    try {
      // Use the existing fetchOrders function from useOrdersApi
      const { data, error } = await fetchOrders({
        startDate,
        endDate,
        activeTab: "search-only",
        validStatuses: ['success', 'failed', 'rejected']
      });
      
      if (error || !data) {
        return {
          materialItems: [],
          noteStrings: [],
          technicianName: "Technician",
          error: error || "Failed to fetch orders"
        };
      }
      
      if (!data.orders || data.orders.length === 0) {
        return {
          materialItems: [],
          noteStrings: [],
          technicianName: "Technician",
          error: "No work orders found for the selected date range"
        };
      }
      
      // Filter by driver if specified
      let filteredOrders = data.orders;
      if (driverFilter) {
        filteredOrders = data.orders.filter(order => {
          const driverName = order.data?.driverName || 
                           order.scheduleInformation?.driverName || 
                           order.completionDetails?.data?.driverName ||
                           order.driverName ||
                           order.extracted?.driverName ||
                           "";
          return driverName.toLowerCase().includes(driverFilter.toLowerCase());
        });
      }
      
      // Extract materials and notes
      const { materialItems, noteStrings } = extractMaterialItems(filteredOrders);
      
      // Get technician name
      const technicianName = extractDriverName(filteredOrders);
      
      return {
        materialItems,
        noteStrings,
        technicianName,
        error: null
      };
    } catch (err) {
      console.error("Error fetching materials data:", err);
      return {
        materialItems: [],
        noteStrings: [],
        technicianName: "Technician",
        error: err instanceof Error ? err.message : "Unknown error occurred"
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Extract material items from order notes
  const extractMaterialItems = (orders: any[]): { materialItems: MaterialItem[], noteStrings: string[] } => {
    const materialItems: MaterialItem[] = [];
    const noteStrings: string[] = [];
    
    orders.forEach((order, orderIndex) => {
      // Get notes from the order - could be in different locations based on API response structure
      let notes = "";
      
      // Try different possible paths to notes
      if (order.data?.notes) {
        notes = order.data.notes;
      } else if (order.completionDetails?.data?.notes) {
        notes = order.completionDetails.data.notes;
      } else if (order.extracted?.notes) {
        notes = order.extracted.notes;
      } else if (order.notes) {
        notes = order.notes;
      }
      
      // Skip if no notes found
      if (!notes || typeof notes !== 'string' || !notes.trim()) return;
      
      // Store the raw note for reference
      noteStrings.push(notes);
      
      // Generate a work order ID for tracking
      const workOrderId = order.data?.orderNo || `wo-${orderIndex + 1}`;
      
      // Look for patterns like (X) MATERIALTYPE
      const materialMatches = notes.match(/\((\d+)\)\s*([A-Za-z0-9-]+)/g);
      
      if (materialMatches) {
        materialMatches.forEach(match => {
          // Extract quantity and type
          const detailMatch = match.match(/\((\d+)\)\s*([A-Za-z0-9-]+)/);
          
          if (detailMatch) {
            const quantity = parseInt(detailMatch[1], 10);
            const type = detailMatch[2].trim().toUpperCase();
            
            // Only add items with quantity > 0
            if (quantity > 0) {
              materialItems.push({
                id: `${type}-${workOrderId}-${Math.random().toString(36).substring(2, 9)}`,
                type,
                quantity,
                workOrderId
              });
            }
          }
        });
      }
    });
    
    return { materialItems, noteStrings };
  };

  // Extract driver name from orders
  const extractDriverName = (orders: any[]): string => {
    if (!orders || orders.length === 0) return "Technician";
    
    // Try to get driver name from the first order
    for (const order of orders) {
      // Check various possible paths to driver name
      if (order.data?.driverName) {
        return order.data.driverName;
      } else if (order.scheduleInformation?.driverName) {
        return order.scheduleInformation.driverName;
      } else if (order.completionDetails?.data?.driverName) {
        return order.completionDetails.data.driverName;
      } else if (order.driverName) {
        return order.driverName;
      } else if (order.extracted?.driverName) {
        return order.extracted.driverName;
      }
    }
    
    return "Technician";
  };

  return {
    isLoading,
    extractMaterialsFromOrders
  };
};
