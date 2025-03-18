
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialItem } from "@/hooks/materials/useMRStore";
import { formatMaterialType, getBadgeVariant } from "@/utils/materialsUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportMaterialsToExcel } from "@/utils/materialsExportUtils";

interface MRSummaryProps {
  data: MaterialItem[];
  technicianName?: string;
}

export const MRSummary = ({ data, technicianName = "Technician" }: MRSummaryProps) => {
  // Group materials by type
  const materialCounts = data.reduce<Record<string, number>>((acc, item) => {
    const { type, quantity } = item;
    acc[type] = (acc[type] || 0) + quantity;
    return acc;
  }, {});

  // Convert to array for sorting
  const sortedMaterials = Object.entries(materialCounts)
    .sort(([typeA], [typeB]) => formatMaterialType(typeA).localeCompare(formatMaterialType(typeB)))
    .map(([type, quantity]) => ({ type, quantity }));

  // Handle export
  const handleExport = () => {
    exportMaterialsToExcel(data, technicianName);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Material Requirements Summary</h3>
        
        {sortedMaterials.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        )}
      </div>

      {sortedMaterials.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No materials data available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedMaterials.map(({ type, quantity }) => (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base">
                  <Badge variant={getBadgeVariant(type)} className="mr-2">
                    {formatMaterialType(type)}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">{type}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{quantity}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
