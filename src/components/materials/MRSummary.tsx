
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MRSummaryProps {
  data: any[];
}

export const MRSummary = ({ data }: MRSummaryProps) => {
  // Aggregate materials by type and SKU
  const aggregatedData = data.reduce((acc, item) => {
    const key = `${item.txtBulkCode}-${item.Inventory_SKU || item.SKU || 'unknown'}`;
    
    if (!acc[key]) {
      acc[key] = {
        materialType: item.txtBulkCode,
        sku: item.Inventory_SKU || item.SKU || 'N/A',
        quantity: 0,
        technicianCount: new Set()
      };
    }
    
    acc[key].quantity += Number(item.SumOfnbrQty || item.Quantity || 0);
    if (item.driverName) {
      acc[key].technicianCount.add(item.driverName);
    }
    
    return acc;
  }, {});
  
  const summaryItems = Object.values(aggregatedData);
  
  // Calculate totals
  const totalQuantity = summaryItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const uniqueMaterialTypes = new Set(data.map(item => item.txtBulkCode)).size;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalQuantity}</CardTitle>
            <CardDescription>Total Items</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{uniqueMaterialTypes}</CardTitle>
            <CardDescription>Material Types</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{summaryItems.length}</CardTitle>
            <CardDescription>Unique SKUs</CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material Type</TableHead>
              <TableHead>SKU/Size</TableHead>
              <TableHead className="text-right">Total Quantity</TableHead>
              <TableHead className="text-right">Technician Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No materials data available
                </TableCell>
              </TableRow>
            ) : (
              summaryItems.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{item.materialType || 'Unknown'}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.technicianCount.size}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
