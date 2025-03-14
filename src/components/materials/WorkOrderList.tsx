
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMaterialType } from "@/utils/materialsUtils";
import { Badge } from "@/components/ui/badge";

interface WorkOrderProps {
  workOrders: any[];
}

export const WorkOrderList = ({ workOrders }: WorkOrderProps) => {
  if (!workOrders || workOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">
          No work orders available for the selected driver
        </p>
      </div>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work Order ID</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Materials</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map(workOrder => (
            <TableRow key={workOrder.id}>
              <TableCell className="font-medium">{workOrder.orderId}</TableCell>
              <TableCell>{workOrder.locationName}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {workOrder.materials.map((material: any, index: number) => (
                    <Badge key={index} variant="outline" className="whitespace-nowrap">
                      {formatMaterialType(material.name)} ({material.quantity})
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
