
import React, { useState } from "react";
import { WorkOrder } from "@/components/workorders/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface NotesTabProps {
  workOrder: WorkOrder;
  onSaveQcNotes?: (workOrderId: string, notes: string) => Promise<void>;
}

export const NotesTab: React.FC<NotesTabProps> = ({ workOrder, onSaveQcNotes }) => {
  const [qcNotes, setQcNotes] = useState(workOrder.qc_notes || "");
  const [isSaving, setIsSaving] = useState(false);
  
  const techNotes = workOrder?.completion_response?.orders?.[0]?.data?.form?.note || "No notes from technician";
  
  const handleSaveQcNotes = async () => {
    if (!onSaveQcNotes) return;
    
    setIsSaving(true);
    try {
      await onSaveQcNotes(workOrder.id, qcNotes);
    } catch (error) {
      console.error("Error saving QC notes:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto">
      {/* Technician Notes */}
      <div>
        <h3 className="font-medium text-sm mb-2 text-gray-700">Technician Notes:</h3>
        <div className="bg-gray-50 p-3 rounded border text-sm">
          {techNotes}
        </div>
      </div>
      
      {/* QC Notes */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-sm text-gray-700">QC Notes:</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveQcNotes}
            disabled={isSaving}
            className="h-7 px-2 text-xs"
          >
            <Save className="h-3 w-3 mr-1" />
            Save Notes
          </Button>
        </div>
        <Textarea
          placeholder="Add quality control notes here..."
          value={qcNotes}
          onChange={(e) => setQcNotes(e.target.value)}
          className="min-h-[100px] text-sm"
        />
      </div>
    </div>
  );
};
