
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MaterialItem } from "@/hooks/materials/useMRStore";

interface MRTableProps {
  data: MaterialItem[];
}

export const MRTable = ({ data }: MRTableProps) => {
  // Format material type for display
  const formatMaterialType = (type: string) => {
    // Handle Polyester MEND filters
    if (type.startsWith('S') && type.endsWith('MEND')) {
      // Extract the size part (between S and MEND)
      const sizeCode = type.substring(1, type.length - 4);
      // Format dimensions based on length of the size code
      let formattedSize = sizeCode;
      if (sizeCode.length === 5) { // e.g., 24242 for 24x24x2
        formattedSize = `${sizeCode.substring(0, 2)}x${sizeCode.substring(2, 4)}x${sizeCode.substring(4, 5)}`;
      } else if (sizeCode.length === 4) { // e.g., 2025 for 20x25
        formattedSize = `${sizeCode.substring(0, 2)}x${sizeCode.substring(2, 4)}`;
      }
      return `Poly MEND: ${formattedSize}`;
    } 
    // Handle regular Polyester filters
    else if (type.startsWith('S')) {
      // Extract the size part (after S)
      const sizeCode = type.substring(1);
      // Format dimensions based on length of the size code
      let formattedSize = sizeCode;
      if (sizeCode.length === 5) { // e.g., 24242 for 24x24x2
        formattedSize = `${sizeCode.substring(0, 2)}x${sizeCode.substring(2, 4)}x${sizeCode.substring(4, 5)}`;
      } else if (sizeCode.length === 4) { // e.g., 2025 for 20x25
        formattedSize = `${sizeCode.substring(0, 2)}x${sizeCode.substring(2, 4)}`;
      }
      return `Poly: ${formattedSize}`;
    } 
    // Handle Fiberglass filters 
    else if (type.startsWith('G') && type.endsWith('B')) {
      // Extract the size part (between G and B)
      const sizeCode = type.substring(1, type.length - 1);
      // Format dimensions based on length of the size code
      let formattedSize = sizeCode;
      if (sizeCode.length === 4) { // e.g., 2025 for 20x25
        formattedSize = `${sizeCode.substring(0, 2)}x${sizeCode.substring(2, 4)}`;
      }
      return `Fiberglass: ${formattedSize}`;
    }
    // Handle Frames
    else if (type.startsWith('F')) {
      // Extract the size part (after F)
      const sizeCode = type.substring(1);
      // Format dimensions based on length of the size code
      let formattedSize = sizeCode;
      if (sizeCode.length === 5) { // e.g., 24242 for 24x24x2
        formattedSize = `${sizeCode.substring(0, 2)}x${sizeCode.substring(2, 4)}x${sizeCode.substring(4, 5)}`;
      } else if (sizeCode.length === 4) { // e.g., 2025 for 20x25
        formattedSize = `${sizeCode.substring(0, 2)}x${sizeCode.substring(2, 4)}`;
      }
      return `Frame: ${formattedSize}`;
    }
    // Handle other material types
    else if (type.includes('FREEZER') || type.includes('FREEZECOOL') || type.includes('COOLER')) {
      return 'Refrigerator Coils';
    } else if (type === 'CONDCOIL') {
      return 'Condenser Coil';
    } else if (type === 'P-TRAP') {
      return 'P-Trap';
    } else if (type === 'PRODUCE') {
      return 'Produce Coil';
    } else {
      return type;
    }
  };

  // Get badge variant based on material type
  const getBadgeVariant = (type: string) => {
    if (type === 'CONDCOIL') {
      return 'success';
    } else if (type.includes('FREEZER') || type.includes('FREEZECOOL') || type.includes('COOLER')) {
      return 'info';
    } else if (type.startsWith('S') && type.endsWith('MEND')) {
      return 'purple'; // For Poly MEND filters
    } else if (type.startsWith('S')) {
      return 'warning'; // For regular Poly filters
    } else if (type.startsWith('G') && type.endsWith('B')) {
      return 'secondary'; // For Fiberglass filters
    } else if (type.startsWith('F')) {
      return 'destructive'; // For Frames
    } else if (type === 'PRODUCE') {
      return 'default'; // For Produce Coils
    } else {
      return 'outline';
    }
  };

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
