import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialItem } from "@/hooks/materials/useMRStore";
import { formatMaterialType } from "@/utils/materialsUtils";
import { ArrowLeft, Download, Inbox } from "lucide-react";
import { DriverRoute } from "@/services/optimoroute/getRoutesService";
import { format } from "date-fns";
import { OrderDetails } from "@/types/optimoroute";
import { exportMaterialsToExcel } from "@/utils/materialsExportUtils";
import { Badge } from "@/components/ui/badge";

interface MRDriverDetailProps {
  driver: DriverRoute;
  orderDetails: OrderDetails[];
}

export const MRDriverDetail = ({ driver, orderDetails }: MRDriverDetailProps) => {
  const totalOrders = orderDetails.length;
  const totalItems = orderDetails.reduce((sum, order) => sum + order.items.length, 0);
  
  const materialsData: MaterialItem[] = orderDetails.reduce((acc: MaterialItem[], order) => {
    order.items.forEach(item => {
      acc.push({
        id: `${order.orderId}-${item.type}`,
        type: item.type,
        quantity: item.quantity,
        workOrderId: order.orderId,
        driverName: driver.driverName,
      });
    });
    return acc;
  }, []);

  const handleExport = () => {
    exportMaterialsToExcel(materialsData, driver.driverName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {driver.driverName} - {format(new Date(driver.date), 'PPP')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalOrders}</div>
              <p className="text-muted-foreground text-sm">total orders</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalItems}</div>
              <p className="text-muted-foreground text-sm">total items</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Order ID</th>
                  <th className="text-left py-2">Material Type</th>
                  <th className="text-right py-2">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.map(order => (
                  order.items.map((item, index) => (
                    <tr key={`${order.orderId}-${item.type}-${index}`} className="border-b">
                      <td className="py-2">{order.orderId}</td>
                      <td className="py-2">
                        {formatMaterialType(item.type)}
                      </td>
                      <td className="py-2 text-right">{item.quantity}</td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </CardFooter>
    </Card>
  );
};
