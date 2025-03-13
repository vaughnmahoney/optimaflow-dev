
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useMRStore } from "@/hooks/materials/useMRStore";

export const MRUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { setMaterialsData, setTechnicians } = useMRStore();
  
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
      
      // Check if the data has the expected format
      const firstRow = jsonData[0] as any;
      if (!firstRow.txtBulkCode && !firstRow.Inventory_SKU && !firstRow.SumOfnbrQty) {
        toast.error("Invalid file format. Please upload a valid MR Excel file");
        return;
      }
      
      // Extract technician names (unique driverName values if present)
      const technicians = new Set<string>();
      jsonData.forEach((row: any) => {
        if (row.driverName) {
          technicians.add(row.driverName);
        }
      });
      
      // Store the data
      setMaterialsData(jsonData);
      setTechnicians(Array.from(technicians));
      
      toast.success(`Successfully loaded ${jsonData.length} material items`);
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
        <CardTitle>Upload Materials Data</CardTitle>
        <CardDescription>
          Upload an Excel file containing materials requirements data
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
