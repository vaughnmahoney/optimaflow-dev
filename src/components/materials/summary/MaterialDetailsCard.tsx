
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialDetailsTable } from "./MaterialDetailsTable";
import { MaterialSummaryItem } from "./MaterialSummaryUtils";

interface MaterialDetailsCardProps {
  summaryItems: MaterialSummaryItem[];
}

export const MaterialDetailsCard = ({ summaryItems }: MaterialDetailsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Material Details</CardTitle>
      </CardHeader>
      <CardContent>
        <MaterialDetailsTable summaryItems={summaryItems} />
      </CardContent>
    </Card>
  );
};
