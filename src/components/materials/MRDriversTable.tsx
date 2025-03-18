import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DriverRoute } from "@/services/optimoroute/getRoutesService";
import { useMRStore, MaterialItem } from "@/hooks/materials/useMRStore";
import { useEffect, useState } from "react";

interface MRDriversTableProps {
  routes: DriverRoute[];
  onSelectDriver: (driver: DriverRoute | null) => void;
}

// Helper function to get a consistent driver ID even when driverSerial is missing
const getDriverId = (driver: DriverRoute): string => {
  // If we have a valid driverSerial, use it
  if (driver.driverSerial && driver.driverSerial.trim() !== '') {
    return driver.driverSerial;
  }
  
  // Otherwise, create a fallback ID using driver name and vehicle registration
  return `driver_${driver.driverName.replace(/\s+/g, '_')}_${driver.vehicleRegistration || 'unknown'}`;
};

export const MRDriversTable = ({ 
  routes, 
  onSelectDriver 
}: MRDriversTableProps) => {
  const materialsData = useMRStore(state => state.materialsData);
  const [driverMaterialCounts, setDriverMaterialCounts] = useState<Record<string, number>>({});
  
  // Calculate material counts for each driver
  useEffect(() => {
    console.log("[DEBUG-TABLE] Calculating distinct material counts for drivers");
    
    // Count materials by driver ID, ensuring each driver has its own count
    const counts: Record<string, number> = {};
    
    // Create mapping between fallback IDs and real driver serials
    const driverIdMap: Record<string, string> = {};
    routes.forEach(route => {
      const fallbackId = getDriverId(route);
      driverIdMap[fallbackId] = route.driverSerial;
      
      // Log if we're using a fallback ID
      if (fallbackId !== route.driverSerial) {
        console.log(`[DEBUG-TABLE] Using fallback ID for ${route.driverName}: ${fallbackId} (original: ${route.driverSerial || 'empty'})`);
      }
    });
    
    // Group materials by driver ID (could be serial or fallback)
    const materialsByDriver = materialsData.reduce((acc, item) => {
      // Skip if no driver ID at all
      if (!item.driverSerial) return acc;
      
      if (!acc[item.driverSerial]) {
        acc[item.driverSerial] = [];
      }
      acc[item.driverSerial].push(item);
      return acc;
    }, {} as Record<string, MaterialItem[]>);
    
    // Calculate total material counts per driver
    Object.entries(materialsByDriver).forEach(([driverIdOrSerial, driverMaterials]) => {
      // Sum up quantities for this driver
      const totalQuantity = driverMaterials.reduce((sum, item) => sum + item.quantity, 0);
      counts[driverIdOrSerial] = totalQuantity;
      
      console.log(`[DEBUG-TABLE] Driver ${driverIdOrSerial}: ${driverMaterials.length} material items, total quantity: ${totalQuantity}`);
      
      // Additional debugging for high counts
      if (totalQuantity > 1000) {
        console.log(`[DEBUG-TABLE] ⚠️ ANOMALY: Very high material count for driver ${driverIdOrSerial}`);
        
        // Analyze by type
        const byType = driverMaterials.reduce((acc, item) => {
          if (!acc[item.type]) acc[item.type] = 0;
          acc[item.type] += item.quantity;
          return acc;
        }, {} as Record<string, number>);
        
        console.log(`[DEBUG-TABLE] Material breakdown by type:`, byType);
        
        // Check for duplicate order IDs
        const orderCounts: Record<string, number> = {};
        driverMaterials.forEach(item => {
          if (item.workOrderId) {
            orderCounts[item.workOrderId] = (orderCounts[item.workOrderId] || 0) + 1;
          }
        });
        
        // Find any orders with suspiciously many materials
        const suspiciousOrders = Object.entries(orderCounts)
          .filter(([_, count]) => count > 10)
          .map(([orderNo, count]) => ({ orderNo, count }));
        
        if (suspiciousOrders.length > 0) {
          console.log(`[DEBUG-TABLE] Suspicious orders with many materials:`, suspiciousOrders);
        }
      }
    });
    
    // Verify all routes have an entry, even if zero
    routes.forEach(route => {
      const driverId = getDriverId(route);
      if (counts[driverId] === undefined && counts[route.driverSerial] === undefined) {
        counts[driverId] = 0;
        console.log(`[DEBUG-TABLE] Driver ${route.driverName} (ID: ${driverId}) has no materials`);
      }
    });
    
    console.log("[DEBUG-TABLE] Final driver material counts:", counts);
    setDriverMaterialCounts(counts);
  }, [routes, materialsData]);

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver</TableHead>
            <TableHead>Stops</TableHead>
            <TableHead>Materials</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route) => {
            // Get the driver ID - either serial or fallback
            const driverId = getDriverId(route);
            
            // Try to find material count using serial first, then fallback ID if needed
            const materialCount = driverMaterialCounts[route.driverSerial] || 
                                  driverMaterialCounts[driverId] || 
                                  0;
            
            // For debugging whether we're using the fallback ID
            if (driverId !== route.driverSerial && materialCount > 0) {
              console.log(`[DEBUG-TABLE] Found ${materialCount} materials using fallback ID for ${route.driverName}`);
            }
            
            return (
              <TableRow key={route.driverSerial || driverId}>
                <TableCell className="font-medium">
                  {route.driverName}
                  {driverId !== route.driverSerial && (
                    <span className="ml-1 text-xs text-muted-foreground">(using fallback ID)</span>
                  )}
                </TableCell>
                <TableCell>{route.stops.length}</TableCell>
                <TableCell>
                  {materialCount > 1000 ? (
                    <span className="text-red-500 font-medium">
                      {materialCount} (⚠️ Unusually high)
                    </span>
                  ) : (
                    materialCount
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectDriver(route)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
