
import { useState } from 'react';
import { getRoutes, GetRoutesParams, DriverRoute } from '../services/getRoutesService';
import { getOrderDetails, OrderDetail } from '../services/getOrderDetailService';
import { useMRStore, MaterialItem } from './useMRStore';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { BatchProcessingStats } from '@/components/bulk-orders/types';

export interface RouteMaterialsResponse {
  isLoading: boolean;
  routes: DriverRoute[];
  orderDetails: OrderDetail[];
  rawRoutesResponse: any;
  rawOrderDetailsResponse: any;
  batchStats: BatchProcessingStats | null;
  fetchRouteMaterials: (params: GetRoutesParams) => Promise<void>;
  reset: () => void;
}

// Parse material requirements from order notes
const parseMaterialsFromNotes = (notes: string, orderNo: string, driverName?: string): MaterialItem[] => {
  if (!notes) return [];
  
  console.log(`[DEBUG] Parsing notes for order ${orderNo}, driver ${driverName || 'unknown'}:`, notes);
  
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
        driverName // Use driver name instead of serial
      });
    }
  }
  
  console.log(`[DEBUG] Total materials parsed for order ${orderNo}: ${materials.length}`);
  return materials;
}

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
      
      // Step 3: Get order details for all order numbers
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
          errors: []
        });
        
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
      const notesArray: string[] = [];
      
      // Create a map of orderNo to driverName
      const orderToDriverMap: Record<string, string> = {};
      
      console.log('[DEBUG] Creating order-to-driver mapping using driver names');
      
      // Build order-to-driver mapping using driver names
      routesResponse.routes.forEach(route => {
        const driverName = route.driverName;
        
        console.log(`[DEBUG] Processing route for driver: ${driverName}`);
        
        // Ensure each order is only mapped to one driver
        route.stops.forEach(stop => {
          const orderNo = stop.orderNo;
          if (orderNo !== "-" && !orderToDriverMap[orderNo]) {
            orderToDriverMap[orderNo] = driverName;
            console.log(`[DEBUG] Mapped order ${orderNo} to driver ${driverName}`);
          } else if (orderNo !== "-" && orderToDriverMap[orderNo] !== driverName) {
            console.log(`[DEBUG] ⚠️ Order ${orderNo} already mapped to driver ${orderToDriverMap[orderNo]}, not remapping to ${driverName}`);
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
        
        // Add to notes array
        notesArray.push(`${orderNo}: ${orderNotes}`);
        
        // Get the driver name for this order
        const driverName = orderToDriverMap[orderNo];
        if (!driverName) {
          console.log(`[DEBUG] ⚠️ No driver found for order ${orderNo}, skipping material parsing`);
          return;
        }
        
        // Parse materials and associate them with the driver name
        const parsedMaterials = parseMaterialsFromNotes(orderNotes, orderNo, driverName);
        
        // Update materials count per driver
        if (parsedMaterials.length > 0) {
          materialsPerDriver[driverName] = (materialsPerDriver[driverName] || 0) + parsedMaterials.reduce((sum, item) => sum + item.quantity, 0);
          materials.push(...parsedMaterials);
        }
      });
      
      console.log('[DEBUG] Materials per driver after processing:');
      Object.entries(materialsPerDriver).forEach(([driverName, count]) => {
        console.log(`[DEBUG] - Driver ${driverName}: ${count} materials`);
      });
      
      // Step 5: Update the MR store with the materials data
      console.log(`[DEBUG] Setting ${materials.length} material items in store, associated with driver names`);
      setMaterialsData(materials);
      setRawNotes(notesArray);
      
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
