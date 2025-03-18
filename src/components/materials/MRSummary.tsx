
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialItem } from "@/hooks/materials/useMRStore";
import { formatMaterialType } from "@/utils/materialsUtils";
import { CustomBadge } from "@/components/ui/custom-badge";

// Map material types to our custom badge variants
const getCustomBadgeVariant = (type: string): "success" | "info" | "purple" | "warning" | "primary" | undefined => {
  if (type === 'CONDCOIL') {
    return 'success';
  } else if (type === 'REFRIGERATOR_COILS' || type.includes('FREEZER') || type.includes('FREEZECOOL') || type.includes('COOLER')) {
    return 'info';
  } else if (type.startsWith('S') && type.endsWith('MEND')) {
    return 'purple';
  } else if (type.startsWith('S')) {
    return 'warning';
  } else if (type.startsWith('G') && type.endsWith('B')) {
    return undefined; // Use default style
  } else if (type.startsWith('P') && type.includes('INS')) {
    return 'primary';
  } else if (type.startsWith('F')) {
    return undefined; // Use default style
  } else if (type === 'PRODUCE') {
    return 'success';
  } else {
    return undefined;
  }
};

interface MRSummaryProps {
  data: MaterialItem[];
}

export const MRSummary = ({ data }: MRSummaryProps) => {
  // Group materials by type and calculate totals
  const materialTotals: Record<string, number> = {};
  
  data.forEach(item => {
    const type = item.type;
    
    // Group refrigerator coils types together
    let normalizedType = type;
    if (type.includes('FREEZER') || type.includes('FREEZECOOL') || type.includes('COOLER')) {
      normalizedType = 'REFRIGERATOR_COILS';
    }
    
    if (!materialTotals[normalizedType]) {
      materialTotals[normalizedType] = 0;
    }
    
    materialTotals[normalizedType] += item.quantity;
  });
  
  // Convert to array for rendering and sort by type
  const summaryItems = Object.entries(materialTotals)
    .map(([type, quantity]) => ({ type, quantity }))
    .sort((a, b) => {
      // Sort CONDCOIL first, then REFRIGERATOR_COILS, then others alphabetically
      if (a.type === 'CONDCOIL') return -1;
      if (b.type === 'CONDCOIL') return 1;
      if (a.type === 'REFRIGERATOR_COILS') return -1;
      if (b.type === 'REFRIGERATOR_COILS') return 1;
      if (a.type === 'PRODUCE') return -1;
      if (b.type === 'PRODUCE') return 1;
      
      // Sort polyester MEND filters before regular polyester filters
      if (a.type.startsWith('S') && a.type.endsWith('MEND') && !(b.type.startsWith('S') && b.type.endsWith('MEND'))) return -1;
      if (!(a.type.startsWith('S') && a.type.endsWith('MEND')) && b.type.startsWith('S') && b.type.endsWith('MEND')) return 1;
      
      // Sort regular polyester filters before fiberglass filters
      if (a.type.startsWith('S') && !b.type.startsWith('S')) return -1;
      if (!a.type.startsWith('S') && b.type.startsWith('S')) return 1;
      
      // Sort pleated filters after fiberglass but before frames
      if (a.type.startsWith('P') && b.type.startsWith('F')) return -1;
      if (a.type.startsWith('F') && b.type.startsWith('P')) return 1;
      
      // Sort fiberglass filters before frames
      if (a.type.startsWith('G') && b.type.startsWith('F')) return -1;
      if (a.type.startsWith('F') && b.type.startsWith('G')) return 1;
      
      return a.type.localeCompare(b.type);
    });
  
  // Calculate totals
  const totalQuantity = summaryItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueMaterialTypes = summaryItems.length;
  
  // Calculate packaging units needed
  const packagingNeeded: Record<string, { label: string, filters: number, packSize: number, units: number }> = {};
  
  // Filter counts by type
  const polyMendTotal = summaryItems
    .filter(item => item.type.startsWith('S') && item.type.endsWith('MEND'))
    .reduce((sum, item) => sum + item.quantity, 0);
    
  const polyTotal = summaryItems
    .filter(item => item.type.startsWith('S') && !item.type.endsWith('MEND'))
    .reduce((sum, item) => sum + item.quantity, 0);
    
  const fiberglassTotal = summaryItems
    .filter(item => item.type.startsWith('G') && item.type.endsWith('B'))
    .reduce((sum, item) => sum + item.quantity, 0);
    
  const pleatedTotal = summaryItems
    .filter(item => item.type.startsWith('P') && item.type.includes('INS'))
    .reduce((sum, item) => sum + item.quantity, 0);
  
  // Define pack sizes
  const POLY_PACK_SIZE = 50;
  const FIBERGLASS_PACK_SIZE = 50;
  const PLEATED_PACK_SIZE = 50;
  
  // Calculate packaging units
  if (polyMendTotal > 0) {
    packagingNeeded['POLY_MEND'] = {
      label: 'Polyester MEND Bags',
      filters: polyMendTotal,
      packSize: POLY_PACK_SIZE,
      units: Math.ceil(polyMendTotal / POLY_PACK_SIZE)
    };
  }
  
  if (polyTotal > 0) {
    packagingNeeded['POLY'] = {
      label: 'Polyester Bags',
      filters: polyTotal,
      packSize: POLY_PACK_SIZE,
      units: Math.ceil(polyTotal / POLY_PACK_SIZE)
    };
  }
  
  if (fiberglassTotal > 0) {
    packagingNeeded['FIBERGLASS'] = {
      label: 'Fiberglass Boxes',
      filters: fiberglassTotal,
      packSize: FIBERGLASS_PACK_SIZE,
      units: Math.ceil(fiberglassTotal / FIBERGLASS_PACK_SIZE)
    };
  }
  
  if (pleatedTotal > 0) {
    packagingNeeded['PLEATED'] = {
      label: 'Pleated Bundles',
      filters: pleatedTotal,
      packSize: PLEATED_PACK_SIZE,
      units: Math.ceil(pleatedTotal / PLEATED_PACK_SIZE)
    };
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalQuantity}</CardTitle>
            <CardDescription>Total Materials Needed</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{uniqueMaterialTypes}</CardTitle>
            <CardDescription>Different Material Types</CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      {/* Packaging units section */}
      {Object.keys(packagingNeeded).length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Packaging Units Needed</CardTitle>
            <CardDescription>For loading your van</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package Type</TableHead>
                  <TableHead>Total Filters</TableHead>
                  <TableHead className="text-right">Units Needed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(packagingNeeded).map(([key, data]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{data.label}</TableCell>
                    <TableCell>{data.filters}</TableCell>
                    <TableCell className="text-right font-bold">{data.units}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Materials summary table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material Type</TableHead>
              <TableHead className="text-right">Total Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                  No materials data available
                </TableCell>
              </TableRow>
            ) : (
              summaryItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <CustomBadge 
                      customVariant={getCustomBadgeVariant(item.type)} 
                      className="font-normal"
                    >
                      {formatMaterialType(item.type)}
                    </CustomBadge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
