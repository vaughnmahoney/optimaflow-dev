
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DriverRoute } from "../services/getRoutesService";
import { useMRStore, MaterialItem } from "../hooks/useMRStore";
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
  
  // Calculate material counts for each driver by name
  useEffect(() => {
    console.log("[DEBUG-TABLE] Calculating material counts for drivers by name");
    
    // Count materials by driver name
    const counts: Record<string, number> = {};
    
    // Group materials by driver name
    const materialsByDriver = materialsData.reduce((acc, item) => {
      // Skip if no driver name
      if (!item.driverName) return acc;
      
      if (!acc[item.driverName]) {
        acc[item.driverName] = [];
      }
      acc[item.driverName].push(item);
      return acc;
    }, {} as Record<string, MaterialItem[]>);
    
    // Calculate total material counts per driver
    Object.entries(materialsByDriver).forEach(([driverName, driverMaterials]) => {
      // Sum up quantities for this driver
      const totalQuantity = driverMaterials.reduce((sum, item) => sum + item.quantity, 0);
      counts[driverName] = totalQuantity;
      
      console.log(`[DEBUG-TABLE] Driver ${driverName}: ${driverMaterials.length} material items, total quantity: ${totalQuantity}`);
    });
    
    // Verify all routes have an entry, even if zero
    routes.forEach(route => {
      if (counts[route.driverName] === undefined) {
        counts[route.driverName] = 0;
        console.log(`[DEBUG-TABLE] Driver ${route.driverName} has no materials`);
      }
    });
    
    console.log("[DEBUG-TABLE] Final driver material counts by name:", counts);
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
            const materialCount = driverMaterialCounts[route.driverName] || 0;
            
            return (
              <TableRow key={route.driverSerial || route.driverName}>
                <TableCell className="font-medium">
                  {route.driverName}
                </TableCell>
                <TableCell>{route.stops.length}</TableCell>
                <TableCell>{materialCount}</TableCell>
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
