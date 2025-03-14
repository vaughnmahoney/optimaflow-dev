
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MaterialItem } from "@/hooks/materials/useMRStore";
import { formatMaterialType, getBadgeVariant } from "@/utils/materialsUtils";

interface MRTableProps {
  data: MaterialItem[];
}

export const MRTable = ({ data }: MRTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material Type</TableHead>
            <TableHead>Work Order ID</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                No materials data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge variant={getBadgeVariant(item.type)} className="font-normal">
                    {formatMaterialType(item.type)}
                  </Badge>
                </TableCell>
                <TableCell>{item.workOrderId || 'Unknown'}</TableCell>
                <TableCell className="text-right font-medium">
                  {item.quantity}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
