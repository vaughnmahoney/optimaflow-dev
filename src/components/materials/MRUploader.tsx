import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useMRStore } from '@/hooks/materials/useMRStore';
import { Upload, FileSpreadsheet, X, FileUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const MRUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setMaterialsData, setRawNotes, clearData } = useMRStore();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
               file.type === 'application/vnd.ms-excel'
      );
      
      if (newFiles.length === 0) {
        toast.error('Please drop only Excel files (.xlsx or .xls)');
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const processExcelFile = async (file: File): Promise<{
    materials: any[],
    notes: string[]
  }> => {
    console.log(`[DEBUG-EXCEL] Processing Excel file: ${file.name}`);
    
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
    
    console.log(`[DEBUG-EXCEL] Extracted ${jsonData.length} rows from Excel`);

    // Extract raw notes for display
    const notes = jsonData.map((row) => {
      const orderNo = row.WorkOrderID || 'Unknown';
      const note = row.Notes || '';
      return `${orderNo}: ${note}`;
    });

    // Process notes to extract material requirements
    const materials = [];
    let totalMaterialsFound = 0;
    
    for (const row of jsonData) {
      const notes = row.Notes;
      const workOrderId = row.WorkOrderID || 'Unknown';

      if (notes) {
        console.log(`[DEBUG-EXCEL] Processing notes for order ${workOrderId}: ${notes.substring(0, 100)}${notes.length > 100 ? '...' : ''}`);
        
        // Parse notes in format "(0) COOLER, (15) FREEZER, (2) G2063B, (2) G2563B"
        const materialsPattern = /\((\d+)\)\s*([^,(]+)(?:,|$)/g;
        let match;
        let materialsInThisRow = 0;
        
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
            materialsInThisRow++;
            totalMaterialsFound++;
          }
        }
        
        if (materialsInThisRow > 10) {
          console.log(`[DEBUG-EXCEL] ⚠️ Found ${materialsInThisRow} materials in a single row for order ${workOrderId}`);
        }
      }
    }
    
    // Log summary of found materials
    console.log(`[DEBUG-EXCEL] Total materials found in Excel: ${totalMaterialsFound} across ${materials.length} entries`);
    
    // Check for anomalies in material quantities
    const materialsByType: Record<string, number> = {};
    materials.forEach(material => {
      materialsByType[material.type] = (materialsByType[material.type] || 0) + material.quantity;
    });
    
    Object.entries(materialsByType).forEach(([type, quantity]) => {
      if (quantity > 1000) {
        console.log(`[DEBUG-EXCEL] ⚠️ ANOMALY: Material type "${type}" has total quantity ${quantity}`);
      }
    });

    return { materials, notes };
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one Excel file');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    
    try {
      let allMaterials: any[] = [];
      let allNotes: string[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          console.log(`[DEBUG-EXCEL] Processing file ${i+1}/${selectedFiles.length}: ${file.name}`);
          
          const { materials, notes } = await processExcelFile(file);
          allMaterials = [...allMaterials, ...materials];
          allNotes = [...allNotes, ...notes];
          
          // Update progress
          setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
        } catch (fileError) {
          console.error(`[DEBUG-EXCEL] Error processing file ${file.name}:`, fileError);
          toast.error(`Failed to process file ${file.name}`);
        }
      }

      console.log(`[DEBUG-EXCEL] All files processed. Total materials: ${allMaterials.length}`);
      setMaterialsData(allMaterials);
      setRawNotes(allNotes);
      
      toast.success(`Processed ${selectedFiles.length} files with ${allMaterials.length} material items`);
      setSelectedFiles([]);
    } catch (error) {
      console.error('[DEBUG-EXCEL] Error processing Excel files:', error);
      toast.error('Failed to process Excel files');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* File drop zone */}
      <div
        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center p-5 text-center">
          <Upload className="w-10 h-10 mb-3 text-gray-500 dark:text-gray-400" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Excel files with materials data (.xlsx, .xls)
          </p>
          <p className="mt-1 text-xs text-primary">
            Multiple files supported
          </p>
        </div>
        <input
          ref={fileInputRef}
          id="material-file-upload"
          type="file"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleFileInputChange}
          disabled={isUploading}
          multiple
        />
      </div>

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            Processing files... {progress}%
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={clearData}
          disabled={isUploading}
        >
          Clear All Data
        </Button>
        
        <div className="space-x-2">
          {selectedFiles.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearFiles}
              disabled={isUploading}
            >
              Clear Files
            </Button>
          )}
          
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? (
              <span className="flex items-center">
                <FileUp className="mr-2 h-4 w-4 animate-pulse" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center">
                <FileUp className="mr-2 h-4 w-4" />
                Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
