
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { MaterialItem } from "@/hooks/materials/useMRStore";
import { exportMaterialsToExcel } from "@/utils/materialsExportUtils";

interface MRActionsProps {
  materialsData: MaterialItem[];
  technicianName: string;
}

export const MRActions = ({ materialsData, technicianName }: MRActionsProps) => {
  const handlePrint = () => {
    window.print();
  };
  
  const handleExport = () => {
    exportMaterialsToExcel(materialsData, technicianName);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Export Excel
      </Button>
    </div>
  );
};
