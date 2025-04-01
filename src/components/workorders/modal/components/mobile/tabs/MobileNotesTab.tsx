
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../../../types";
import { Package } from "lucide-react";

interface MobileNotesTabProps {
  workOrder: WorkOrder;
}

export const MobileNotesTab = ({ workOrder }: MobileNotesTabProps) => {
  const completionData = workOrder.completion_response?.orders?.[0]?.data;
  const searchData = workOrder.search_response?.data;
  
  // Extract material quantity
  const materialQuantity = searchData?.customField3 || "N/A";

  return (
    <Card className="border-gray-100">
      <div className="space-y-4 px-4 py-4">
        {/* Materials Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-gray-700 mb-1">
            <Package className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-medium">Materials</h3>
          </div>
          <div className="space-y-0.5">
            <div className="grid grid-cols-[80px_1fr]">
              <span className="text-xs text-gray-500">Quantity:</span>
              <span className="text-xs">{materialQuantity}</span>
            </div>
          </div>
        </div>
        
        {/* Tech Notes */}
        <div className="space-y-1 border-t pt-3 first:border-t-0 first:pt-0">
          <div className="flex items-center gap-1.5 text-gray-700 mb-1">
            <h3 className="text-sm font-medium">Tech Notes</h3>
          </div>
          <div>
            {completionData?.form?.note ? (
              <p className="text-xs whitespace-pre-wrap text-gray-700">{completionData.form.note}</p>
            ) : (
              <p className="text-xs text-gray-500 italic">No tech notes available</p>
            )}
          </div>
        </div>
        
        {/* Service Notes */}
        <div className="space-y-1 border-t pt-3">
          <div className="flex items-center gap-1.5 text-gray-700 mb-1">
            <h3 className="text-sm font-medium">Service Notes</h3>
          </div>
          <div>
            {workOrder.service_notes ? (
              <p className="text-xs whitespace-pre-wrap text-gray-700">{workOrder.service_notes}</p>
            ) : (
              <p className="text-xs text-gray-500 italic">No service notes available</p>
            )}
          </div>
        </div>
        
        {/* Additional Notes */}
        <div className="space-y-1 border-t pt-3">
          <div className="flex items-center gap-1.5 text-gray-700 mb-1">
            <h3 className="text-sm font-medium">Additional Notes</h3>
          </div>
          <div>
            {searchData?.customField1 ? (
              <p className="text-xs whitespace-pre-wrap text-gray-700">{searchData.customField1}</p>
            ) : (
              <p className="text-xs text-gray-500 italic">No additional notes available</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
