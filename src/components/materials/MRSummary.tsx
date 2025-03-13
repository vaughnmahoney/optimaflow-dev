
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MaterialItem } from "@/hooks/materials/useMRStore";

interface MRSummaryProps {
  data: MaterialItem[];
}

export const MRSummary = ({ data }: MRSummaryProps) => {
  // Group materials by type and calculate totals
  const materialTotals: Record<string, number> = {};
  
  // First pass: Group refrigerator coils
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
      return a.type.localeCompare(b.type);
    });
  
  // Format material type for display
  const formatMaterialType = (type: string) => {
    if (type === 'REFRIGERATOR_COILS') {
      return 'Refrigerator Coils';
    } else if (type === 'CONDCOIL') {
      return 'Condenser Coil';
    } else if (type.startsWith('G')) {
      return 'Standard Filter';
    } else if (type.startsWith('S')) {
      return 'Specialty Filter';
    } else if (type === 'P-TRAP') {
      return 'P-Trap';
    } else if (type === 'PRODUCE') {
      return 'Produce Filter';
    } else {
      return type;
    }
  };
  
  // Get badge variant based on material type
  const getBadgeVariant = (type: string) => {
    if (type === 'CONDCOIL') {
      return 'success';
    } else if (type === 'REFRIGERATOR_COILS') {
      return 'info';
    } else {
      return 'outline';
    }
  };
  
  // Calculate totals
  const totalQuantity = summaryItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueMaterialTypes = summaryItems.length;
  
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
                    <Badge variant={getBadgeVariant(item.type)} className="font-normal">
                      {formatMaterialType(item.type)}
                    </Badge>
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
