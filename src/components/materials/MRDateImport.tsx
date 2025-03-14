
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Upload, FileSpreadsheet, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMRStore } from "@/store/useMRStore";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

export const MRDateImport = () => {
  const [date, setDate] = useState<Date>();
  const [isUploading, setIsUploading] = useState(false);
  const { 
    setMaterialsData, 
    setRawNotes, 
    clearData, 
    setLoading,
    setError
  } = useMRStore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setLoading(true);
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
      setError(null);
      toast.success(`Processed ${jsonData.length} work orders with ${materials.length} material items`);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast.error('Failed to process Excel file');
      setError('Failed to process Excel file');
    } finally {
      setIsUploading(false);
      setLoading(false);
      // Clear file input value to allow uploading the same file again
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Material Requirements</CardTitle>
        <CardDescription>
          Upload an Excel file with material requirements or select from routes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload" className="flex items-center">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Upload Excel
            </TabsTrigger>
            <TabsTrigger value="dates" className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Select Date
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
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
          </TabsContent>
          
          <TabsContent value="dates">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Route Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button 
                className="w-full" 
                disabled={!date}
                onClick={() => {
                  toast.info("API integration for route-based material requirements is in development");
                }}
              >
                <Clock className="mr-2 h-4 w-4" />
                Fetch Routes
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end border-t px-6 py-4">
        <Button 
          variant="outline" 
          onClick={clearData}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : "Clear Data"}
        </Button>
      </CardFooter>
    </Card>
  );
};
