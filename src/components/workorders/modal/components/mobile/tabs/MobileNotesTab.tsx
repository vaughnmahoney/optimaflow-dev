
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../../../types";

interface MobileNotesTabProps {
  workOrder: WorkOrder;
}

export const MobileNotesTab = ({ workOrder }: MobileNotesTabProps) => {
  const completionData = workOrder.completion_response?.orders?.[0]?.data;
  const searchData = workOrder.search_response?.data;

  return (
    <Card className="border-gray-100">
      <div className="space-y-4 px-4 py-4">
        {/* Tech Notes */}
        <div className="space-y-1 first:border-t-0 first:pt-0">
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
