
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../types";
import { Package } from "lucide-react";

interface NotesTabProps {
  workOrder: WorkOrder;
}

export const NotesTab = ({ workOrder }: NotesTabProps) => {
  const completionData = workOrder.completion_response?.orders?.[0]?.data;
  const searchData = workOrder.search_response?.data;
  
  // Extract material quantity
  const materialQuantity = searchData?.customField3 || "N/A";
  
  return (
    <div className="space-y-4">
      {/* Materials card */}
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-3">
            <Package className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-800 text-lg">Materials</h3>
          </div>
          <div className="pl-7 grid grid-cols-[100px_1fr] gap-y-2">
            <span className="text-sm text-gray-600">Quantity:</span>
            <span className="text-sm text-gray-700">{materialQuantity}</span>
          </div>
        </div>
      </Card>

      {/* Notes card */}
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-5">
          <h3 className="font-medium text-blue-800 text-lg border-b border-gray-100 pb-2 mb-3">Tech Notes</h3>
          <div className="pl-2">
            {completionData?.form?.note ? (
              <p className="text-sm whitespace-pre-wrap text-gray-700">{completionData.form.note}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">No tech notes available</p>
            )}
          </div>
        </div>
      </Card>

      {/* Service Notes card */}
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-5">
          <h3 className="font-medium text-blue-800 text-lg border-b border-gray-100 pb-2 mb-3">Service Notes</h3>
          <div className="pl-2">
            {workOrder.service_notes ? (
              <p className="text-sm whitespace-pre-wrap text-gray-700">{workOrder.service_notes}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">No service notes available</p>
            )}
          </div>
        </div>
      </Card>

      {/* Additional Notes card */}
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-5">
          <h3 className="font-medium text-blue-800 text-lg border-b border-gray-100 pb-2 mb-3">Additional Notes</h3>
          <div className="pl-2">
            {searchData?.customField1 ? (
              <p className="text-sm whitespace-pre-wrap text-gray-700">{searchData.customField1}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">No additional notes available</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
