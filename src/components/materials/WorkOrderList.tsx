
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Material {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
}

interface WorkOrder {
  id: string;
  orderId: string;
  locationName: string;
  address: string;
  date: string;
  materials: Material[];
  notes?: string;
}

interface WorkOrderListProps {
  workOrders: WorkOrder[];
}

export const WorkOrderList = ({ workOrders }: WorkOrderListProps) => {
  if (!workOrders || workOrders.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No work orders to display</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
      <div className="space-y-4">
        {workOrders.map((workOrder) => (
          <Card key={workOrder.id} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{workOrder.locationName}</CardTitle>
                  <CardDescription className="text-xs">{workOrder.address}</CardDescription>
                </div>
                <Badge variant="outline">{workOrder.orderId}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Notes section */}
              {workOrder.notes && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-1">Notes:</h4>
                  <p className="text-sm text-muted-foreground bg-slate-50 p-2 rounded">
                    {workOrder.notes}
                  </p>
                </div>
              )}
              
              <h4 className="text-sm font-medium mb-2">Materials:</h4>
              <div className="space-y-1">
                {workOrder.materials.map((material) => (
                  <div key={material.id} className="flex justify-between items-center">
                    <span className="text-sm">{material.name}</span>
                    <Badge variant="secondary">
                      {material.quantity} {material.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
