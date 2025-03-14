
import { Calendar, Clock, Database, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const BulkOrdersInfoCard = () => {
  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Info className="h-5 w-5 mr-2 text-blue-500" />
          Bulk Import Instructions
        </CardTitle>
        <CardDescription>
          Follow these steps to import orders in bulk
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="space-y-2 mt-2">
            <ol className="list-decimal list-inside text-sm space-y-3 pl-1">
              <li className="flex items-start">
                <Calendar className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  <span className="font-medium">Select a date range</span> - Must be the same date on a Monday for best results
                </span>
              </li>
              <li className="flex items-start">
                <Clock className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  <span className="font-medium">Select "with completion"</span> - This will fetch all completion details for orders
                </span>
              </li>
              <li className="flex items-start">
                <Database className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  <span className="font-medium">Click "Fetch Orders"</span> - Orders will display in the table below
                </span>
              </li>
              <li className="flex items-start">
                <Database className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <span className="font-medium text-green-700">Click "Save to Database"</span> - This will save all fetched orders to the database for QC processing
                </span>
              </li>
            </ol>
          </div>

          <div className="text-sm mt-2 pt-2 border-t border-slate-200">
            <p className="text-slate-600 italic">
              Note: Processing large batches may take several minutes. Orders will appear in the QC interface after they've been saved to the database.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
