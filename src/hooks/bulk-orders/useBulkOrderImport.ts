
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ImportResult = {
  success: boolean;
  total: number;
  imported: number;
  duplicates: number;
  errors: number;
  errorDetails?: string[];
};

export const useBulkOrderImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState({ 
    current: 0, 
    total: 0, 
    percentage: 0 
  });

  // Size of each batch to send to the edge function
  const BATCH_SIZE = 25;

  const importOrders = async (orders: any[]) => {
    if (!orders || orders.length === 0) {
      toast.error("No orders to import");
      return null;
    }

    setIsImporting(true);
    setImportResult(null);
    
    // Initialize progress tracking
    const totalOrders = orders.length;
    setImportProgress({ current: 0, total: totalOrders, percentage: 0 });
    
    // Create batches of orders to process
    const batches = [];
    for (let i = 0; i < orders.length; i += BATCH_SIZE) {
      batches.push(orders.slice(i, i + BATCH_SIZE));
    }
    
    toast.info(`Importing ${orders.length} orders in ${batches.length} batches...`);
    
    // Track results across all batches
    const combinedResult: ImportResult = {
      success: true,
      total: orders.length,
      imported: 0,
      duplicates: 0,
      errors: 0,
      errorDetails: []
    };

    try {
      // Process each batch sequentially
      for (let i = 0; i < batches.length; i++) {
        const batchOrders = batches[i];
        console.log(`Processing batch ${i + 1}/${batches.length} (${batchOrders.length} orders)...`);
        
        try {
          // Call the edge function with just this batch
          const { data, error } = await supabase.functions.invoke('import-bulk-orders', {
            body: { orders: batchOrders }
          });

          if (error) {
            throw new Error(`Error calling import function (batch ${i + 1}): ${error.message}`);
          }

          // Accumulate results
          combinedResult.imported += data.imported;
          combinedResult.duplicates += data.duplicates;
          combinedResult.errors += data.errors;
          
          if (data.errorDetails && data.errorDetails.length > 0) {
            combinedResult.errorDetails = [
              ...(combinedResult.errorDetails || []),
              ...data.errorDetails
            ];
          }
          
          // Update progress
          const processedSoFar = Math.min((i + 1) * BATCH_SIZE, totalOrders);
          const percentage = Math.round((processedSoFar / totalOrders) * 100);
          setImportProgress({ 
            current: processedSoFar, 
            total: totalOrders, 
            percentage 
          });
          
        } catch (batchError) {
          console.error(`Error in batch ${i + 1}:`, batchError);
          combinedResult.errors += batchOrders.length;
          combinedResult.errorDetails = [
            ...(combinedResult.errorDetails || []),
            `Batch ${i + 1} error: ${batchError.message}`
          ];
          
          // Don't let a single batch failure stop the entire process
          // Just log it and continue with the next batch
        }
      }
      
      // Set success based on whether all orders were processed without errors
      combinedResult.success = combinedResult.errors === 0;
      
      // Set the final result
      setImportResult(combinedResult);
      
      // Show appropriate toast based on the final result
      if (combinedResult.success) {
        toast.success(`Successfully imported ${combinedResult.imported} orders (${combinedResult.duplicates} duplicates skipped)`);
      } else if (combinedResult.imported > 0) {
        toast.warning(`Imported ${combinedResult.imported} orders with ${combinedResult.errors} errors (${combinedResult.duplicates} duplicates skipped)`);
      } else {
        toast.error(`Import failed with ${combinedResult.errors} errors (${combinedResult.duplicates} duplicates skipped)`);
      }

      return combinedResult;
    } catch (error) {
      console.error("Error importing orders:", error);
      toast.error(`Error importing orders: ${error.message || "Unknown error"}`);
      setImportResult({
        success: false,
        total: orders.length,
        imported: combinedResult.imported,
        duplicates: combinedResult.duplicates,
        errors: orders.length - combinedResult.imported - combinedResult.duplicates,
        errorDetails: [...(combinedResult.errorDetails || []), error.message]
      });
      return null;
    } finally {
      setIsImporting(false);
      setImportProgress({ current: 0, total: 0, percentage: 0 });
    }
  };

  return {
    importOrders,
    isImporting,
    importResult,
    importProgress
  };
};
