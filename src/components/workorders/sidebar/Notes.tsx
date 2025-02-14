
import { NotesProps } from "../types/sidebar";

export const Notes = ({ workOrder }: NotesProps) => {
  const getNotes = () => {
    const notes = [];
    
    if (workOrder.service_notes) notes.push(workOrder.service_notes);
    if (workOrder.serviceNotes) notes.push(workOrder.serviceNotes);
    if (workOrder.description) notes.push(workOrder.description);
    if (workOrder.completion_data?.data?.form?.note) notes.push(workOrder.completion_data.data.form.note);
    if (workOrder.completion_response?.notes) notes.push(workOrder.completion_response.notes);
    if (workOrder.completion_response?.proofOfDelivery?.notes) {
      notes.push(workOrder.completion_response.proofOfDelivery.notes);
    }
    
    return notes.filter(Boolean).join('\n\n');
  };

  const notes = getNotes();
  if (!notes) return null;

  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
      <p className="text-sm whitespace-pre-wrap">{notes}</p>
    </div>
  );
};
