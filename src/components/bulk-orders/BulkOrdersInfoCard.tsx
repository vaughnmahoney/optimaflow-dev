
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const BulkOrdersInfoCard = () => {
  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm mb-1">Bulk Orders Processing</h3>
            <p className="text-sm text-muted-foreground">
              This tool allows you to import and process work orders in bulk from OptimoRoute. 
              The progressive loading method fetches data in smaller batches to handle large datasets efficiently.
            </p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc pl-4 space-y-1">
              <li>Select a date range to load orders for QC processing</li>
              <li>Orders are automatically filtered to show only completed, failed, or rejected jobs</li> 
              <li>You can pause and resume loading at any time</li>
              <li>Successfully loaded orders will be available in the QC Dashboard</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
