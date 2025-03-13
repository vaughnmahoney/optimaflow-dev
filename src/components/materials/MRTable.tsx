
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface MRTableProps {
  data: any[];
  technician: string | null;
}

export const MRTable = ({ data, technician }: MRTableProps) => {
  // Format material type for display
  const formatMaterialType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'poly':
        return 'Standard Filter';
      case 'poly menar':
        return 'Specialty Filter';
      case 'fg-blue':
        return 'Fiberglass Filter';
      case 'pleat-ins':
        return 'Pleated Insert';
      case 'frame':
        return 'Filter Frame';
      default:
        return type || 'Unknown';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material Type</TableHead>
            <TableHead>SKU/Size</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            {!technician && <TableHead>Technician</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={technician ? 3 : 4} className="text-center py-6 text-muted-foreground">
                No materials data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {formatMaterialType(item.txtBulkCode)}
                  </Badge>
                </TableCell>
                <TableCell>{item.Inventory_SKU || item.SKU || item.Size || 'N/A'}</TableCell>
                <TableCell className="text-right font-medium">
                  {item.SumOfnbrQty || item.Quantity || 0}
                </TableCell>
                {!technician && (
                  <TableCell>{item.driverName || 'Unassigned'}</TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
