
import { FileSpreadsheet, Upload } from "lucide-react";

export const MREmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/10 min-h-[300px]">
      <FileSpreadsheet className="h-10 w-10 mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-2">No materials data loaded</h3>
      <p className="text-muted-foreground max-w-md mb-4">
        Upload an Excel file containing materials requirement data using the upload button above.
      </p>
      
      <div className="flex flex-col items-center text-sm text-muted-foreground">
        <div className="flex items-center mb-1">
          <Upload className="h-4 w-4 mr-1" />
          <span>Step 1: Upload your Excel file</span>
        </div>
        <span>Step 2: Review the generated materials requirements</span>
        <span>Step 3: Print or export for technicians</span>
      </div>
    </div>
  );
};
