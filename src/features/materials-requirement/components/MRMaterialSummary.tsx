
import { Fragment } from "react";
import { useMRStore } from "../hooks/useMRStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMaterialType, getBadgeVariant, getMaterialCategory } from "../utils/materialsUtils";
import { Package } from "lucide-react";
import { MaterialItem } from "../hooks/useMRStore";

interface MRMaterialSummaryProps {
  materials?: MaterialItem[];
  categoryFilter?: string;
}

export const MRMaterialSummary = ({
  materials,
  categoryFilter
}: MRMaterialSummaryProps) => {
  const { getTotalMaterialsCount, materialsData } = useMRStore();
  
  // Use provided materials or get from store
  const itemsToUse = materials || materialsData;
  
  // Get the materials count (either from the provided materials or from the store)
  const materialsCount = materials 
    ? itemsToUse.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.quantity;
        return acc;
      }, {} as Record<string, number>)
    : getTotalMaterialsCount();
  
  // Group materials by category
  const materialsByCategory = Object.entries(materialsCount).reduce((acc, [type, count]) => {
    const category = getMaterialCategory(type);
    
    // Apply category filter if provided
    if (categoryFilter && category !== categoryFilter) {
      return acc;
    }
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push({ type, count });
    return acc;
  }, {} as Record<string, { type: string; count: number }[]>);
  
  // Sort categories alphabetically
  const sortedCategories = Object.keys(materialsByCategory).sort();
  
  // Calculate total material count
  const totalMaterialCount = Object.values(materialsCount).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Materials Summary
        </h3>
        <Badge variant="outline" className="font-normal">
          {totalMaterialCount} Total
        </Badge>
      </div>
      
      {sortedCategories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <p className="text-muted-foreground">No materials found</p>
          </CardContent>
        </Card>
      ) : (
        sortedCategories.map((category) => {
          const categoryMaterials = materialsByCategory[category];
          const categoryTotal = categoryMaterials.reduce((sum, { count }) => sum + count, 0);
          
          return (
            <Card key={category} className="overflow-hidden">
              <CardHeader className="py-3 bg-muted/50">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    {category}
                  </span>
                  <Badge variant="outline" className="font-normal">
                    {categoryTotal}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {categoryMaterials
                    .sort((a, b) => a.type.localeCompare(b.type))
                    .map(({ type, count }) => (
                      <div 
                        key={type}
                        className="flex items-center justify-between px-4 py-2"
                      >
                        <Badge 
                          variant={getBadgeVariant(type)}
                          className="font-normal"
                        >
                          {formatMaterialType(type)}
                        </Badge>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};
