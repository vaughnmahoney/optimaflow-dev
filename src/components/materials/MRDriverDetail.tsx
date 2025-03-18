
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialItem } from "@/hooks/materials/useMRStore";
import { formatMaterialType } from "@/utils/materialsUtils";
import { ArrowLeft, Download } from "lucide-react";
import { DriverRoute } from "@/services/optimoroute/getRoutesService";
import { format } from "date-fns";
import { OrderDetail } from "@/services/optimoroute/getOrderDetailService";
import { exportMaterialsToExcel } from "@/utils/materialsExportUtils";
import { Badge } from "@/components/ui/badge";

interface MRDriverDetailProps {
  driver: DriverRoute;
  orderDetails: OrderDetail[];
  onBack?: () => void;
}

export const MRDriverDetail = ({ driver, orderDetails, onBack }: MRDriverDetailProps) => {
  const totalOrders = orderDetails.length;
  const totalItems = orderDetails.reduce((sum, order) => {
    // Check if order.data and order.data.items exist
    return sum + (order.data.items?.length || 0);
  }, 0);
  
  const materialsData: MaterialItem[] = orderDetails.reduce((acc: MaterialItem[], order) => {
    // Check if items exists before processing
    if (order.data.items) {
      order.data.items.forEach(item => {
        acc.push({
          id: `${order.data.orderNo}-${item.type}`,
          type: item.type,
          quantity: item.quantity,
          workOrderId: order.data.orderNo,
          driverName: driver.driverName,
        });
      });
    }
    return acc;
  }, []);

  const handleExport = () => {
    exportMaterialsToExcel(materialsData, driver.driverName);
  };

  // Format the date or use a fallback
  const displayDate = driver.stops && driver.stops.length > 0 && driver.stops[0].scheduledAt 
    ? format(new Date(driver.stops[0].scheduledAt.split('T')[0]), 'PPP')
    : 'No date available';

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {driver.driverName} - {displayDate}
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
                  // Check if items exists before mapping
                  order.data.items ? (
                    order.data.items.map((item, index) => (
                      <tr key={`${order.data.orderNo}-${item.type}-${index}`} className="border-b">
                        <td className="py-2">{order.data.orderNo}</td>
                        <td className="py-2">
                          {formatMaterialType(item.type)}
                        </td>
                        <td className="py-2 text-right">{item.quantity}</td>
                      </tr>
                    ))
                  ) : (
                    <tr key={order.data.orderNo} className="border-b">
                      <td className="py-2">{order.data.orderNo}</td>
                      <td className="py-2 text-muted-foreground">No materials</td>
                      <td className="py-2 text-right">-</td>
                    </tr>
                  )
                ))}
                {orderDetails.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-muted-foreground">
                      No order details available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <Button variant="outline" onClick={handleExport} className={onBack ? '' : 'ml-auto'}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </CardFooter>
    </Card>
  );
};
