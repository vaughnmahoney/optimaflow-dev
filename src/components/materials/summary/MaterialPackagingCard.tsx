
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackagingUnitsTable } from "./PackagingUnitsTable";

interface MaterialPackagingCardProps {
  packagingUnits: Record<string, { label: string; count: number; unit: string }>;
}

export const MaterialPackagingCard = ({ packagingUnits }: MaterialPackagingCardProps) => {
  if (Object.keys(packagingUnits).length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Loading Units</CardTitle>
      </CardHeader>
      <CardContent>
        <PackagingUnitsTable packagingUnits={packagingUnits} />
      </CardContent>
    </Card>
  );
};
