
import { NotesProps } from "../types/sidebar";

export const Notes = ({ workOrder }: NotesProps) => {
  const getNotes = () => {
    const notes = [];
    
    // Service notes
    if (workOrder.service_notes) notes.push(workOrder.service_notes);
    if (workOrder.description) notes.push(workOrder.description);
    
    // Custom fields
    if (workOrder.custom_fields?.field1) notes.push(workOrder.custom_fields.field1);
    
    // Completion notes
    if (workOrder.completion_data?.data?.form?.note) {
      notes.push(workOrder.completion_data.data.form.note);
    }
    
    // Location notes
    if (workOrder.location?.notes) notes.push(workOrder.location.notes);
    
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
