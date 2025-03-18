import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverRoute } from "@/services/optimoroute/getRoutesService";
import { OrderDetail } from "@/services/optimoroute/getOrderDetailService";
import { useMRStore } from "@/hooks/materials/useMRStore";
import { ArrowLeft, Download, MapPin, Package, Printer } from "lucide-react";
import { formatMaterialType, getBadgeVariant } from "@/utils/materialsUtils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { MRMaterialSummary } from "./MRMaterialSummary";
import { exportMaterialsToExcel } from "@/utils/materialsExportUtils";

interface MRDriverDetailProps {
  driver: DriverRoute;
  orderDetails: OrderDetail[];
  onBack: () => void;
}

export const MRDriverDetail = ({ driver, orderDetails, onBack }: MRDriverDetailProps) => {
  const [activeTab, setActiveTab] = useState("summary");
  const { materialsData } = useMRStore();
  
  // Filter order details for the selected driver
  const driverOrderNumbers = driver.stops
    .map(stop => stop.orderNo)
    .filter(orderNo => orderNo !== "-");
  
  const driverOrders = orderDetails.filter(order => 
    driverOrderNumbers.includes(order.data.orderNo)
  );
  
  // Filter materials for this driver by name
  const driverMaterials = materialsData.filter(material => 
    material.driverName === driver.driverName
  );
  
  // Handle printing
  const handlePrint = () => {
    window.print();
  };
  
  // Handle export - updated to use Excel export
  const handleExport = () => {
    // Use the same Excel export function used in MRActions
    exportMaterialsToExcel(driverMaterials, driver.driverName);
  };
  
  return (
    <div className="space-y-6">
      <Card className="print:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between print:pb-2">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="mr-2 print:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              Materials for {driver.driverName}
            </CardTitle>
          </div>
          
          <div className="flex gap-2 print:hidden">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-wrap gap-4 text-sm mb-2">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-1">Stops</Badge>
              <span>{driver.stops.length}</span>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="mr-1">Total Materials</Badge>
              <span>{driverMaterials.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4 print:hidden">
          <TabsTrigger value="summary" className="flex-1">Materials Summary</TabsTrigger>
          <TabsTrigger value="orders" className="flex-1">Work Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-0">
          <MRMaterialSummary materials={driverMaterials} />
        </TabsContent>
        
        <TabsContent value="orders" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Work Orders ({driverOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full">
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
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No orders found for this driver
                        </TableCell>
                      </TableRow>
                    ) : (
                      driverOrders.map((order) => {
                        // Get materials for this order
                        const orderMaterials = driverMaterials.filter(
                          m => m.workOrderId === order.data.orderNo
                        );
                        
                        return (
                          <TableRow key={order.data.orderNo}>
                            <TableCell className="font-medium">
                              {order.data.orderNo}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{order.data.locationName || "Unknown Location"}</span>
                                <span className="text-xs text-muted-foreground">
                                  {order.data.address || "No address"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {orderMaterials.length > 0 ? (
                                  orderMaterials.map((material, idx) => (
                                    <Badge 
                                      key={idx} 
                                      variant={getBadgeVariant(material.type)}
                                      className="font-normal"
                                    >
                                      {material.quantity} × {formatMaterialType(material.type)}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    No materials
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                              {order.data.notes ? (
                                <div className="text-sm line-clamp-2 hover:line-clamp-none">
                                  {order.data.notes}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  No notes
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
