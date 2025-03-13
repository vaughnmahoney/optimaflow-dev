
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MaterialItem } from "@/hooks/materials/useMRStore";

interface MRSummaryProps {
  data: MaterialItem[];
}

export const MRSummary = ({ data }: MRSummaryProps) => {
  // Group materials by type and calculate totals
  const materialTotals = data.reduce((acc: Record<string, number>, item) => {
    const type = item.type;
    
    if (!acc[type]) {
      acc[type] = 0;
    }
    
    acc[type] += item.quantity;
    return acc;
  }, {});
  
  // Convert to array for rendering and sort by type
  const summaryItems = Object.entries(materialTotals)
    .map(([type, quantity]) => ({ type, quantity }))
    .sort((a, b) => a.type.localeCompare(b.type));
  
  // Format material type for display
  const formatMaterialType = (type: string) => {
    // Add special formatting based on known material types
    if (type.includes('FREEZER') || type.includes('FREEZECOOL')) {
      return 'Freezer Filter';
    } else if (type.includes('COOLER')) {
      return 'Cooler Filter';
    } else if (type.includes('CONDCOIL')) {
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
                    <Badge variant={item.type === 'CONDCOIL' ? 'success' : 'outline'} className="font-normal">
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
