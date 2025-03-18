
import { useState } from 'react';
import { getRoutes, GetRoutesParams, DriverRoute } from '@/services/optimoroute/getRoutesService';
import { getOrderDetails, OrderDetail } from '@/services/optimoroute/getOrderDetailService';
import { useMRStore, MaterialItem } from '@/hooks/materials/useMRStore';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { BatchProcessingStats } from '@/components/bulk-orders/types';

export interface RouteMaterialsResponse {
  isLoading: boolean;
  routes: DriverRoute[];
  orderDetails: OrderDetail[];
  rawRoutesResponse: any; // Added to store raw API response
  rawOrderDetailsResponse: any; // Added to store raw API response
  batchStats: BatchProcessingStats | null;
  fetchRouteMaterials: (params: GetRoutesParams) => Promise<void>;
  reset: () => void;
}

// Parse material requirements from order notes
const parseMaterialsFromNotes = (notes: string, orderNo: string, driverSerial?: string): MaterialItem[] => {
  if (!notes) return [];
  
  console.log(`[DEBUG] Parsing notes for order ${orderNo}, driver ${driverSerial || 'unknown'}:`, notes);
  
  // Parse format like "(0) COOLER, (15) FREEZER, (2) G2063B, (2) G2563B"
  const materialsPattern = /\((\d+)\)\s*([^,(]+)(?:,|$)/g;
  const materials: MaterialItem[] = [];
  
  let match;
  while ((match = materialsPattern.exec(notes)) !== null) {
    const quantity = parseInt(match[1], 10);
    const type = match[2].trim();
    
    console.log(`[DEBUG] Found material: ${quantity} x ${type}`);
    
    if (quantity > 0 && type) {
      materials.push({
        id: uuidv4(),
        type,
        quantity,
        workOrderId: orderNo,
        driverSerial // Ensure this is properly passed in
      });
    }
  }
  
  console.log(`[DEBUG] Total materials parsed for order ${orderNo}: ${materials.length}`);
  return materials;
};

export const useMaterialRoutes = (): RouteMaterialsResponse => {
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<DriverRoute[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [rawRoutesResponse, setRawRoutesResponse] = useState<any>(null);
  const [rawOrderDetailsResponse, setRawOrderDetailsResponse] = useState<any>(null);
  const [batchStats, setBatchStats] = useState<BatchProcessingStats | null>(null);
  const { setMaterialsData, setRawNotes, setTechnicianName, clearData } = useMRStore();

  const fetchRouteMaterials = async (params: GetRoutesParams) => {
    setIsLoading(true);
    setBatchStats(null);
    
    try {
      // Step 1: Get routes for the selected date
      console.log(`[DEBUG] Fetching routes for date: ${params.date}`);
      const routesResponse = await getRoutes(params);
      
      // Store the raw response for debugging
      setRawRoutesResponse(routesResponse);
      
      if (!routesResponse.success || !routesResponse.routes?.length) {
        toast.error(routesResponse.error || "No routes found for the selected date");
        setIsLoading(false);
        return;
      }
      
      console.log(`[DEBUG] Found ${routesResponse.routes.length} routes`);
      setRoutes(routesResponse.routes);
      
      // Step 2: Collect all order numbers from the routes
      const orderNumbers = routesResponse.routes
        .flatMap(route => route.stops)
        .map(stop => stop.orderNo)
        .filter(orderNo => orderNo !== "-");
      
      if (!orderNumbers.length) {
        toast.warning("No valid order numbers found in routes");
        setIsLoading(false);
        return;
      }
      
      console.log(`[DEBUG] Collected ${orderNumbers.length} order numbers from routes`);
      
      // Step 3: Get order details for all order numbers (now with parallel batch processing)
      const orderDetailsResponse = await getOrderDetails(orderNumbers);
      
      // Store the raw response for debugging
      setRawOrderDetailsResponse(orderDetailsResponse);
      
      // Update batch stats for UI
      if (orderDetailsResponse.batchStats) {
        setBatchStats({
          totalBatches: orderDetailsResponse.batchStats.totalBatches,
          completedBatches: orderDetailsResponse.batchStats.completedBatches,
          successfulBatches: orderDetailsResponse.batchStats.successfulBatches,
          failedBatches: orderDetailsResponse.batchStats.failedBatches,
          totalOrdersProcessed: orderDetailsResponse.batchStats.totalOrdersProcessed || 0,
          errors: [] // Fix: Initialize with empty array since the property is expected but not provided
        });
        
        // Log batch statistics if available
        console.log(`[DEBUG] Batch processing stats: ${orderDetailsResponse.batchStats.successfulBatches}/${orderDetailsResponse.batchStats.totalBatches} batches successful`);
      }
      
      if (!orderDetailsResponse.success || !orderDetailsResponse.orders?.length) {
        toast.error(orderDetailsResponse.error || "Failed to fetch order details");
        setIsLoading(false);
        return;
      }
      
      console.log(`[DEBUG] Received ${orderDetailsResponse.orders.length} order details`);
      setOrderDetails(orderDetailsResponse.orders);
      
      // Step 4: Extract material requirements from order notes
      const materials: MaterialItem[] = [];
      const notes: string[] = [];
      
      // Create a map of orderNo to driverSerial for associating materials with drivers
      const orderToDriverMap: Record<string, string> = {};
      
      console.log('[DEBUG] Creating order-to-driver mapping');
      
      // Build a clean, non-duplicated order-to-driver mapping
      routesResponse.routes.forEach(route => {
        const driverSerial = route.driverSerial;
        console.log(`[DEBUG] Processing route for driver: ${route.driverName} (${driverSerial})`);
        
        // Ensure each order is only mapped to one driver by checking if it's already mapped
        route.stops.forEach(stop => {
          const orderNo = stop.orderNo;
          if (orderNo !== "-" && !orderToDriverMap[orderNo]) {
            orderToDriverMap[orderNo] = driverSerial;
            console.log(`[DEBUG] Mapped order ${orderNo} to driver ${driverSerial}`);
          } else if (orderNo !== "-" && orderToDriverMap[orderNo] !== driverSerial) {
            console.log(`[DEBUG] ⚠️ Order ${orderNo} already mapped to driver ${orderToDriverMap[orderNo]}, not remapping to ${driverSerial}`);
          }
        });
      });
      
      console.log(`[DEBUG] Created mapping for ${Object.keys(orderToDriverMap).length} orders`);
      
      // Track materials per driver for debugging
      const materialsPerDriver: Record<string, number> = {};
      
      // Process each order and parse its materials
      orderDetailsResponse.orders.forEach(order => {
        if (!order.data?.orderNo || !order.data?.notes) {
          console.log(`[DEBUG] Skipping order with missing data:`, order.data);
          return;
        }
        
        const orderNo = order.data.orderNo;
        const orderNotes = order.data.notes;
        
        // Fix: Add to notes array instead of using push on the notes string
        notes.push(`${orderNo}: ${orderNotes}`);
        
        // Get the driver serial for this order
        const driverSerial = orderToDriverMap[orderNo];
        if (!driverSerial) {
          console.log(`[DEBUG] ⚠️ No driver found for order ${orderNo}, skipping material parsing`);
          return;
        }
        
        // Parse materials and associate them with the driver
        const parsedMaterials = parseMaterialsFromNotes(orderNotes, orderNo, driverSerial);
        
        // Update materials count per driver
        if (parsedMaterials.length > 0) {
          materialsPerDriver[driverSerial] = (materialsPerDriver[driverSerial] || 0) + parsedMaterials.length;
          materials.push(...parsedMaterials);
        }
      });
      
      console.log('[DEBUG] Materials per driver after processing:');
      Object.entries(materialsPerDriver).forEach(([driverSerial, count]) => {
        console.log(`[DEBUG] - Driver ${driverSerial}: ${count} materials`);
      });
      
      // Double-check final materials for driver associations
      const materialsByDriver = materials.reduce((acc, item) => {
        const ds = item.driverSerial || 'unknown';
        if (!acc[ds]) acc[ds] = [];
        acc[ds].push(item);
        return acc;
      }, {} as Record<string, MaterialItem[]>);
      
      console.log('[DEBUG] Final materials by driver:');
      Object.entries(materialsByDriver).forEach(([driverSerial, items]) => {
        console.log(`[DEBUG] - Driver ${driverSerial}: ${items.length} materials`);
      });
      
      // Additional check for any anomalies in the data
      const driverWithMostMaterials = Object.entries(materialsPerDriver).sort((a, b) => b[1] - a[1])[0];
      if (driverWithMostMaterials && driverWithMostMaterials[1] > 1000) {
        console.log(`[DEBUG] ⚠️ ANOMALY DETECTED: Driver ${driverWithMostMaterials[0]} has ${driverWithMostMaterials[1]} materials!`);
        
        // Detailed analysis of high-count driver's materials
        const highCountDriverMaterials = materials.filter(m => m.driverSerial === driverWithMostMaterials[0]);
        const materialTypeCounts = highCountDriverMaterials.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + item.quantity;
          return acc;
        }, {} as Record<string, number>);
        
        console.log(`[DEBUG] Material type breakdown for high-count driver:`, materialTypeCounts);
      }
      
      // Step 5: Update the MR store with the materials data
      console.log(`[DEBUG] Setting ${materials.length} material items in store, properly associated with drivers`);
      setMaterialsData(materials);
      setRawNotes(notes);
      
      // Set technician name based on driver if available
      if (routesResponse.routes.length === 1) {
        setTechnicianName(routesResponse.routes[0].driverName);
      } else if (routesResponse.routes.length > 1) {
        setTechnicianName('Multiple Drivers');
      }
      
      toast.success(`Found ${materials.length} material items across ${orderDetailsResponse.orders.length} orders`);
      
    } catch (error) {
      console.error("[DEBUG] Error in fetchRouteMaterials:", error);
      toast.error("An error occurred while fetching materials");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setRoutes([]);
    setOrderDetails([]);
    setRawRoutesResponse(null);
    setRawOrderDetailsResponse(null);
    setBatchStats(null);
    clearData();
  };

  return {
    isLoading,
    routes,
    orderDetails,
    rawRoutesResponse,
    rawOrderDetailsResponse,
    batchStats,
    fetchRouteMaterials,
    reset
  };
};
