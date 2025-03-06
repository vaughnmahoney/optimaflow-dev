
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

  const importOrders = async (orders: any[]) => {
    if (!orders || orders.length === 0) {
      toast.error("No orders to import");
      return null;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      toast.info(`Importing ${orders.length} orders, please wait...`);
      
      const { data, error } = await supabase.functions.invoke('import-bulk-orders', {
        body: { orders }
      });

      if (error) {
        throw new Error(`Error calling import function: ${error.message}`);
      }

      setImportResult(data);

      if (data.success) {
        toast.success(`Successfully imported ${data.imported} orders (${data.duplicates} duplicates skipped)`);
      } else if (data.imported > 0) {
        toast.warning(`Imported ${data.imported} orders with ${data.errors} errors (${data.duplicates} duplicates skipped)`);
      } else {
        toast.error(`Import failed with ${data.errors} errors (${data.duplicates} duplicates skipped)`);
      }

      return data;
    } catch (error) {
      console.error("Error importing orders:", error);
      toast.error(`Error importing orders: ${error.message || "Unknown error"}`);
      setImportResult({
        success: false,
        total: orders.length,
        imported: 0,
        duplicates: 0,
        errors: 1,
        errorDetails: [error.message]
      });
      return null;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importOrders,
    isImporting,
    importResult
  };
};
