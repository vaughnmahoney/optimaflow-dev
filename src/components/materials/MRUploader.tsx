
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useMRStore, MaterialItem } from "@/hooks/materials/useMRStore";

export const MRUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { setMaterialsData, setRawNotes, setTechnicianName } = useMRStore();
  
  const extractMaterialItems = (notes: string[]): MaterialItem[] => {
    const materialItems: MaterialItem[] = [];
    
    notes.forEach((note, workOrderIndex) => {
      if (!note.trim()) return;
      
      // Generate a work order ID for tracking
      const workOrderId = `wo-${workOrderIndex + 1}`;
      
      // Look for patterns like (X) MATERIALTYPE
      const materialMatches = note.match(/\((\d+)\)\s*([A-Za-z0-9-]+)/g);
      
      if (materialMatches) {
        materialMatches.forEach(match => {
          // Extract quantity and type
          const detailMatch = match.match(/\((\d+)\)\s*([A-Za-z0-9-]+)/);
          
          if (detailMatch) {
            const quantity = parseInt(detailMatch[1], 10);
            const type = detailMatch[2].trim().toUpperCase();
            
            // Only add items with quantity > 0
            if (quantity > 0) {
              materialItems.push({
                id: `${type}-${workOrderId}-${Math.random().toString(36).substring(2, 9)}`,
                type,
                quantity,
                workOrderId
              });
            }
          }
        });
      }
    });
    
    return materialItems;
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Read the Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Get the first sheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Process the data
      if (jsonData.length === 0) {
        toast.error("No data found in the Excel file");
        return;
      }
      
      // Check if the data has Notes column
      let notesData: string[] = [];
      
      jsonData.forEach((row: any) => {
        // Check for Notes column (case-insensitive)
        const notesKey = Object.keys(row).find(key => 
          key.toLowerCase() === 'notes'
        );
        
        if (notesKey && row[notesKey]) {
          notesData.push(row[notesKey]);
        }
      });
      
      if (notesData.length === 0) {
        toast.error("No 'Notes' column found in the Excel file");
        return;
      }
      
      // Extract technician name from filename (if possible)
      const techName = file.name.split('.')[0].replace(/_/g, ' ');
      setTechnicianName(techName || 'Technician');
      
      // Parse the notes into material items
      const materialItems = extractMaterialItems(notesData);
      
      if (materialItems.length === 0) {
        toast.error("Couldn't extract material items from the Notes column");
        return;
      }
      
      // Store the data
      setMaterialsData(materialItems);
      setRawNotes(notesData);
      
      toast.success(`Successfully loaded ${materialItems.length} material items from ${notesData.length} work orders`);
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast.error("Failed to process the Excel file");
    } finally {
      setIsUploading(false);
      // Reset the file input
      e.target.value = "";
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Technician Work Order Data</CardTitle>
        <CardDescription>
          Upload an Excel file containing work orders with materials in the Notes column
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button 
              variant="outline" 
              className="w-full"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Select Excel File
                </>
              )}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <FileSpreadsheet className="h-5 w-5 inline-block mr-1" />
            <span>Supported formats: .xlsx, .xls</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
