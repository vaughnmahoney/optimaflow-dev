
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrderDetail } from "@/services/optimoroute/getOrderDetailService";
import { MaterialItem } from "@/hooks/materials/useMRStore";
import { DriverRoute } from "@/services/optimoroute/getRoutesService";
import { Clipboard, FileText } from "lucide-react";

interface MRDriverOrdersProps {
  selectedDriver: DriverRoute | null;
  orderDetails: OrderDetail[];
  materials: MaterialItem[];
}

export const MRDriverOrders = ({ selectedDriver, orderDetails, materials }: MRDriverOrdersProps) => {
  if (!selectedDriver) return null;
  
  // Filter order details for the selected driver
  const driverOrderNumbers = selectedDriver.stops
    .map(stop => stop.orderNo)
    .filter(orderNo => orderNo !== "-");
  
  const driverOrders = orderDetails.filter(order => 
    driverOrderNumbers.includes(order.data.orderNo)
  );
  
  // Group materials by work order
  const materialsByOrder: Record<string, MaterialItem[]> = {};
  
  materials.forEach(material => {
    if (material.workOrderId) {
      if (!materialsByOrder[material.workOrderId]) {
        materialsByOrder[material.workOrderId] = [];
      }
      materialsByOrder[material.workOrderId].push(material);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Work Orders for {selectedDriver.driverName}
        </CardTitle>
        <CardDescription>
          {driverOrders.length} orders with material requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Materials</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driverOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No orders found for this driver
                  </TableCell>
                </TableRow>
              ) : (
                driverOrders.map(order => (
                  <TableRow key={order.data.orderNo}>
                    <TableCell className="font-medium">
                      {order.data.orderNo}
                    </TableCell>
                    <TableCell>
                      {order.data.locationName || "Unknown Location"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {materialsByOrder[order.data.orderNo] ? (
                          materialsByOrder[order.data.orderNo].map((material, idx) => (
                            <div key={idx} className="flex items-center">
                              <span className="bg-primary/10 text-primary text-xs rounded px-2 py-0.5">
                                ({material.quantity}) {material.type}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            No materials
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {order.data.notes ? (
                        <div className="flex items-center group relative">
                          <span className="truncate text-sm">{order.data.notes}</span>
                          <Clipboard className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 cursor-pointer" 
                            onClick={() => navigator.clipboard.writeText(order.data.notes)}
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          No notes
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
