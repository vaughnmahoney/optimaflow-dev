
import { Card, CardContent } from "@/components/ui/card";
import { useMRStore } from "@/store/useMRStore";
import { formatMaterialType, groupMaterialsByCategory } from "@/utils/materialsUtils";
import { Badge } from "@/components/ui/badge";

export const MaterialRequirementsSummary = () => {
  const { materialsData } = useMRStore();
  
  // If there's no material data, show empty state
  if (materialsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">
          No material requirements data available. Please import data first.
        </p>
      </div>
    );
  }
  
  // Group materials by type
  const groupedMaterials = groupMaterialsByCategory(materialsData);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(groupedMaterials).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center p-3 border rounded-md">
              <div className="flex-1">
                <p className="font-medium">{formatMaterialType(type)}</p>
              </div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {count}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
