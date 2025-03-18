
import { MaterialItem } from "@/hooks/materials/useMRStore";
import { MaterialStatsCards } from "./summary/MaterialStatsCards";
import { MaterialPackagingCard } from "./summary/MaterialPackagingCard";
import { MaterialDetailsCard } from "./summary/MaterialDetailsCard";
import { calculatePackagingUnits, groupMaterialsByType } from "./summary/MaterialSummaryUtils";

interface MRMaterialSummaryProps {
  materials: MaterialItem[];
}

export const MRMaterialSummary = ({ materials }: MRMaterialSummaryProps) => {
  // Group materials by type and calculate totals
  const summaryItems = groupMaterialsByType(materials);
  const totalItems = summaryItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueTypes = summaryItems.length;
  
  // Calculate packaging units based on filter types
  const packagingUnits = calculatePackagingUnits(summaryItems);
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <MaterialStatsCards 
        totalItems={totalItems}
        uniqueTypes={uniqueTypes}
        packagingUnits={packagingUnits}
      />
      
      {/* Packaging Units */}
      <MaterialPackagingCard packagingUnits={packagingUnits} />
      
      {/* Material Items List */}
      <MaterialDetailsCard summaryItems={summaryItems} />
    </div>
  );
};
