
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const WorkOrderInfoCard = () => {
  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
          OptimaFlow Work Order System
        </CardTitle>
        <CardDescription>
          Current state of the quality control workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Import Status:</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-start">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                <div>
                  <span className="font-medium">Single import</span> - Orders are processed immediately and appear in the table.
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-4 w-4 mr-2 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-medium">Bulk import</span> - Orders are processed from bulk import test page. <span className="text-amber-700 font-medium">It may take a few minutes</span> for orders to appear in the frontend (performance improvements in progress).
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Quality Control Workflow:</h3>
            <p className="text-sm">
              All imported orders are displayed for quality control review. QC specialists can:
            </p>
            <ul className="list-disc list-inside text-sm pl-2 space-y-1">
              <li><span className="font-medium text-green-700">Approve</span> - Work orders that meet quality standards</li>
              <li><span className="font-medium text-red-700">Flag</span> - Work orders that need attention</li>
              <li><span className="font-medium text-blue-700">Resolve</span> - Flagged orders that have been addressed</li>
              <li><span className="font-medium text-orange-700">Reject</span> - Orders that cannot be processed</li>
            </ul>
          </div>

          <div className="text-sm mt-2 pt-2 border-t border-slate-200">
            <p className="text-slate-600 italic">
              Note: All orders are stored in the database. Post-QC processes (billing, reporting, etc.) are for future development.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
