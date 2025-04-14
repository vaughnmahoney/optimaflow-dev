
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { WorkOrder } from "../../../types";
import { SafetyNotesDialog } from "../SafetyNotesDialog";

interface TechMobileNotesTabProps {
  workOrder: WorkOrder;
}

export const TechMobileNotesTab = ({ 
  workOrder
}: TechMobileNotesTabProps) => {
  const [isSafetyNotesDialogOpen, setIsSafetyNotesDialogOpen] = useState(false);
  const [safetyNotes, setSafetyNotes] = useState(workOrder.safety_notes || "");
  
  const completionData = workOrder.completion_response?.orders?.[0]?.data;
  const searchData = workOrder.search_response?.data;

  const hasSafetyNotes = !!safetyNotes;

  const handleSafetyNotesClick = () => {
    setIsSafetyNotesDialogOpen(true);
  };

  const handleNotesSaved = (notes: string) => {
    setSafetyNotes(notes);
  };

  return (
    <div className="flex-1 overflow-auto p-4 bg-gray-50">
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
          
          {/* Safety Notes (visible if they exist) */}
          {hasSafetyNotes && (
            <div className="space-y-1 border-t pt-3">
              <div className="flex items-center gap-1.5 text-gray-700 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                <h3 className="text-sm font-medium text-blue-700">Safety Notes</h3>
              </div>
              <div className="border rounded-md p-2 bg-blue-50 border-blue-200">
                <p className="text-xs whitespace-pre-wrap text-gray-700">{safetyNotes}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <div className="bg-white border-t px-4 py-3 flex justify-center items-center">
        <Button 
          variant={hasSafetyNotes ? "outline" : "outline"}
          size="sm" 
          onClick={handleSafetyNotesClick}
          className={`gap-2 ${hasSafetyNotes ? 'bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100 hover:text-blue-700' : ''}`}
        >
          <ShieldCheck className={`h-4 w-4 ${hasSafetyNotes ? 'text-blue-500' : ''}`} />
          Safety Notes
        </Button>
      </div>

      {/* Safety Notes Dialog */}
      <SafetyNotesDialog
        isOpen={isSafetyNotesDialogOpen}
        onClose={() => setIsSafetyNotesDialogOpen(false)}
        workOrderId={workOrder.id}
        initialNotes={safetyNotes}
        onNotesSaved={handleNotesSaved}
      />
    </div>
  );
};
