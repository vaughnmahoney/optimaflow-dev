
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MaterialItem } from "@/hooks/materials/useMRStore";
import { formatMaterialType, getBadgeVariant } from "@/utils/materialsUtils";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportMaterialsToExcel } from "@/utils/materialsExportUtils";

interface MRTableProps {
  data: MaterialItem[];
  showExport?: boolean;
  technicianName?: string;
}

export const MRTable = ({ data, showExport = true, technicianName = "Technician" }: MRTableProps) => {
  const handleExport = () => {
    exportMaterialsToExcel(data, technicianName);
  };

  return (
    <div className="space-y-4">
      {showExport && data.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      )}
      
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
    </div>
  );
};
