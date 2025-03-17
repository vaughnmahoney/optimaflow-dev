
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "../ui/button";

export const MREmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/10 min-h-[300px]">
      <FileSpreadsheet className="h-12 w-12 mb-4 text-muted-foreground" />
      <h3 className="text-xl font-medium mb-2">No materials data loaded</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Upload an Excel file containing materials requirement data or fetch from OptimoRoute.
      </p>
      
      <div className="flex flex-col items-center text-sm text-muted-foreground mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="h-4 w-4" />
          <span>Step 1: Upload your Excel file or fetch from OptimoRoute</span>
        </div>
        <span className="mb-2">Step 2: Review the generated materials requirements</span>
        <span>Step 3: Print or export for technicians</span>
      </div>
      
      <Button variant="outline" onClick={() => document.getElementById('material-file-upload')?.click()}>
        <Upload className="h-4 w-4 mr-2" />
        Browse Files
      </Button>
    </div>
  );
};
