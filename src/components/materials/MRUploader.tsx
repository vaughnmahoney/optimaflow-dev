
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { MRApiLoader } from './MRApiLoader';
import { Button } from '@/components/ui/button';
import { useMRStore } from '@/hooks/materials/useMRStore';
import { Upload, FileSpreadsheet, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const MRUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { setMaterialsData, setRawNotes, clearData } = useMRStore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      // Extract raw notes for display
      const notes = jsonData.map((row) => {
        const orderNo = row.WorkOrderID || 'Unknown';
        const note = row.Notes || '';
        return `${orderNo}: ${note}`;
      });

      // Process notes to extract material requirements
      const materials = [];
      for (const row of jsonData) {
        const notes = row.Notes;
        const workOrderId = row.WorkOrderID || 'Unknown';

        if (notes) {
          // Parse notes in format "(0) COOLER, (15) FREEZER, (2) G2063B, (2) G2563B"
          const materialsPattern = /\((\d+)\)\s*([^,(]+)(?:,|$)/g;
          let match;
          
          while ((match = materialsPattern.exec(notes)) !== null) {
            const quantity = parseInt(match[1], 10);
            const type = match[2].trim();
            
            if (quantity > 0 && type) {
              materials.push({
                id: uuidv4(),
                type,
                quantity,
                workOrderId
              });
            }
          }
        }
      }

      setMaterialsData(materials);
      setRawNotes(notes);
      toast.success(`Processed ${jsonData.length} work orders with ${materials.length} material items`);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast.error('Failed to process Excel file');
    } finally {
      setIsUploading(false);
      // Clear file input value to allow uploading the same file again
      event.target.value = '';
    }
  };

  return (
    <Tabs defaultValue="upload">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="upload" className="flex items-center">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Upload Excel
        </TabsTrigger>
        <TabsTrigger value="api" className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          From Routes
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upload">
        <Card className="p-6">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="material-file-upload" className="w-full cursor-pointer">
              <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Excel file with materials data</p>
                </div>
                <input 
                  id="material-file-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".xlsx,.xls" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>
            </label>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={clearData} 
              disabled={isUploading}
            >
              Clear Data
            </Button>
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="api">
        <MRApiLoader />
      </TabsContent>
    </Tabs>
  );
};
