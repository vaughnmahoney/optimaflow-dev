
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3X3, Package, PackageCheck } from "lucide-react";

interface MaterialStatsCardsProps {
  totalItems: number;
  uniqueTypes: number;
  packagingUnits: Record<string, { label: string; count: number; unit: string }>;
}

export const MaterialStatsCards = ({ 
  totalItems, 
  uniqueTypes, 
  packagingUnits 
}: MaterialStatsCardsProps) => {
  const totalPackagingUnits = Object.values(packagingUnits).reduce((sum, unit) => sum + unit.count, 0);
  
  return (
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
            {totalPackagingUnits}
          </div>
          <p className="text-muted-foreground text-sm">total units</p>
        </CardContent>
      </Card>
    </div>
  );
};
