
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MaterialItem } from "@/hooks/materials/useMRStore";
import { formatMaterialType } from "@/utils/materialsUtils";
import { Grid3X3, Package, PackageCheck } from "lucide-react";
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

interface MRMaterialSummaryProps {
  materials: MaterialItem[];
}

export const MRMaterialSummary = ({ materials }: MRMaterialSummaryProps) => {
  // Group materials by type
  const materialsByType: Record<string, number> = {};
  
  materials.forEach(item => {
    const type = item.type;
    if (!materialsByType[type]) {
      materialsByType[type] = 0;
    }
    materialsByType[type] += item.quantity;
  });
  
  // Convert to array for rendering and sort by type
  const summaryItems = Object.entries(materialsByType)
    .map(([type, quantity]) => ({ type, quantity }))
    .sort((a, b) => {
      // Sort special types first
      if (a.type === 'CONDCOIL') return -1;
      if (b.type === 'CONDCOIL') return 1;
      if (a.type.includes('FREEZER') || a.type.includes('COOLER')) return -1;
      if (b.type.includes('FREEZER') || b.type.includes('COOLER')) return 1;
      
      // Sort alphabetically by type
      return a.type.localeCompare(b.type);
    });
  
  // Calculate totals
  const totalItems = summaryItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueTypes = summaryItems.length;
  
  // Calculate packaging units based on filter types
  const packagingUnits: Record<string, { label: string, count: number, unit: string }> = {};
  
  // Count filter types
  const polyesters = summaryItems
    .filter(item => item.type.startsWith('S'))
    .reduce((sum, item) => sum + item.quantity, 0);
    
  const fiberglass = summaryItems
    .filter(item => item.type.startsWith('G'))
    .reduce((sum, item) => sum + item.quantity, 0);
    
  const pleated = summaryItems
    .filter(item => item.type.startsWith('P'))
    .reduce((sum, item) => sum + item.quantity, 0);
  
  if (polyesters > 0) {
    packagingUnits['poly'] = { 
      label: 'Polyester Filters', 
      count: Math.ceil(polyesters / 50), 
      unit: 'bags'
    };
  }
  
  if (fiberglass > 0) {
    packagingUnits['fiber'] = { 
      label: 'Fiberglass Filters', 
      count: Math.ceil(fiberglass / 50), 
      unit: 'boxes'
    };
  }
  
  if (pleated > 0) {
    packagingUnits['pleated'] = { 
      label: 'Pleated Filters', 
      count: Math.ceil(pleated / 50), 
      unit: 'bundles'
    };
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Total Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalItems}</div>
            <p className="text-muted-foreground text-sm">items needed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Grid3X3 className="mr-2 h-4 w-4" />
              Material Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uniqueTypes}</div>
            <p className="text-muted-foreground text-sm">unique types</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <PackageCheck className="mr-2 h-4 w-4" />
              Packaging Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Object.values(packagingUnits).reduce((sum, unit) => sum + unit.count, 0)}
            </div>
            <p className="text-muted-foreground text-sm">total units</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Packaging Units */}
      {Object.keys(packagingUnits).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Loading Units</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filter Type</TableHead>
                  <TableHead className="text-right">Units Needed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(packagingUnits).map((unit, index) => (
                  <TableRow key={index}>
                    <TableCell>{unit.label}</TableCell>
                    <TableCell className="text-right font-medium">
                      {unit.count} {unit.unit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Material Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Material Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
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
                    <TableCell className="text-right font-medium">
                      {item.quantity}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
