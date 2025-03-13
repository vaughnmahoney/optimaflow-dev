
import { useState } from 'react';
import { getRoutes, GetRoutesParams, DriverRoute } from '@/services/optimoroute/getRoutesService';
import { getOrderDetails, OrderDetail } from '@/services/optimoroute/getOrderDetailService';
import { useMRStore, MaterialItem } from '@/hooks/materials/useMRStore';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface RouteMaterialsResponse {
  isLoading: boolean;
  routes: DriverRoute[];
  orderDetails: OrderDetail[];
  fetchRouteMaterials: (params: GetRoutesParams) => Promise<void>;
  reset: () => void;
}

// Parse material requirements from order notes
const parseMaterialsFromNotes = (notes: string, orderNo: string): MaterialItem[] => {
  if (!notes) return [];
  
  // Parse format like "(0) COOLER, (15) FREEZER, (2) G2063B, (2) G2563B"
  const materialsPattern = /\((\d+)\)\s*([^,(]+)(?:,|$)/g;
  const materials: MaterialItem[] = [];
  
  let match;
  while ((match = materialsPattern.exec(notes)) !== null) {
    const quantity = parseInt(match[1], 10);
    const type = match[2].trim();
    
    if (quantity > 0 && type) {
      materials.push({
        id: uuidv4(),
        type,
        quantity,
        workOrderId: orderNo
      });
    }
  }
  
  return materials;
};

export const useMaterialRoutes = (): RouteMaterialsResponse => {
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<DriverRoute[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const { setMaterialsData, setRawNotes, setTechnicianName, clearData } = useMRStore();

  const fetchRouteMaterials = async (params: GetRoutesParams) => {
    setIsLoading(true);
    
    try {
      // Step 1: Get routes for the selected date
      const routesResponse = await getRoutes(params);
      
      if (!routesResponse.success || !routesResponse.routes?.length) {
        toast.error(routesResponse.error || "No routes found for the selected date");
        setIsLoading(false);
        return;
      }
      
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
      
      // Step 3: Get order details for all order numbers
      const orderDetailsResponse = await getOrderDetails(orderNumbers);
      
      if (!orderDetailsResponse.success || !orderDetailsResponse.orders?.length) {
        toast.error(orderDetailsResponse.error || "Failed to fetch order details");
        setIsLoading(false);
        return;
      }
      
      setOrderDetails(orderDetailsResponse.orders);
      
      // Step 4: Extract material requirements from order notes
      const materials: MaterialItem[] = [];
      const notes: string[] = [];
      
      orderDetailsResponse.orders.forEach(order => {
        if (order.data?.notes) {
          notes.push(`${order.data.orderNo}: ${order.data.notes}`);
          materials.push(...parseMaterialsFromNotes(order.data.notes, order.data.orderNo));
        }
      });
      
      // Step 5: Update the MR store with the materials data
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
      console.error("Error in fetchRouteMaterials:", error);
      toast.error("An error occurred while fetching materials");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setRoutes([]);
    setOrderDetails([]);
    clearData();
  };

  return {
    isLoading,
    routes,
    orderDetails,
    fetchRouteMaterials,
    reset
  };
};
