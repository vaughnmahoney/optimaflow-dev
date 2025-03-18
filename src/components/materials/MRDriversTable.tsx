
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DriverRoute } from "@/services/optimoroute/getRoutesService";
import { useMRStore, MaterialItem } from "@/hooks/materials/useMRStore";
import { useEffect, useState } from "react";

interface MRDriversTableProps {
  routes: DriverRoute[];
  onSelectDriver: (driver: DriverRoute | null) => void;
}

export const MRDriversTable = ({ 
  routes, 
  onSelectDriver 
}: MRDriversTableProps) => {
  const materialsData = useMRStore(state => state.materialsData);
  const [driverMaterialCounts, setDriverMaterialCounts] = useState<Record<string, number>>({});
  
  // Calculate material counts for each driver
  useEffect(() => {
    console.log("[DEBUG-TABLE] Calculating distinct material counts for drivers");
    
    // Count materials by driver serial, ensuring each driver has its own count
    const counts: Record<string, number> = {};
    
    // Group materials by driver serial
    const materialsByDriver = materialsData.reduce((acc, item) => {
      if (!item.driverSerial) return acc;
      
      if (!acc[item.driverSerial]) {
        acc[item.driverSerial] = [];
      }
      acc[item.driverSerial].push(item);
      return acc;
    }, {} as Record<string, MaterialItem[]>);
    
    // Calculate total material counts per driver
    Object.entries(materialsByDriver).forEach(([driverSerial, driverMaterials]) => {
      // Sum up quantities for this driver
      const totalQuantity = driverMaterials.reduce((sum, item) => sum + item.quantity, 0);
      counts[driverSerial] = totalQuantity;
      
      console.log(`[DEBUG-TABLE] Driver ${driverSerial}: ${driverMaterials.length} material items, total quantity: ${totalQuantity}`);
      
      // Additional debugging for high counts
      if (totalQuantity > 1000) {
        console.log(`[DEBUG-TABLE] ⚠️ ANOMALY: Very high material count for driver ${driverSerial}`);
        
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
      if (counts[route.driverSerial] === undefined) {
        counts[route.driverSerial] = 0;
        console.log(`[DEBUG-TABLE] Driver ${route.driverName} (${route.driverSerial}) has no materials`);
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
            const materialCount = driverMaterialCounts[route.driverSerial] || 0;
            
            return (
              <TableRow key={route.driverSerial}>
                <TableCell className="font-medium">{route.driverName}</TableCell>
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
