
import React, { useState } from "react";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { SearchBar } from "./search/SearchBar";
import { WorkOrderTable } from "./table/WorkOrderTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./table/EmptyState";
import { Button } from "@/components/ui/button";
import { History, Search, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const OrderHistoryContent = () => {
  const { searchResults, isLoading, noResults, searchByLocation } = useLocationSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [techNote, setTechNote] = useState("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    searchByLocation(value);
  };

  const handleOpenNoteDialog = (workOrderId: string) => {
    setSelectedOrderId(workOrderId);
    
    // Get existing tech notes if available
    const selectedOrder = searchResults.find(order => order.id === workOrderId);
    if (selectedOrder && selectedOrder.qc_notes) {
      setTechNote(selectedOrder.qc_notes);
    } else {
      setTechNote("");
    }
    
    setIsNoteDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (!selectedOrderId) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ qc_notes: techNote })
        .eq('id', selectedOrderId);
        
      if (error) throw error;
      
      toast.success("Notes saved successfully");
      setIsNoteDialogOpen(false);
      
      // Update the local data to reflect the change
      searchByLocation(searchQuery);
    } catch (error: any) {
      console.error("Error saving tech notes:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const EmptySearchState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <History className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">Search Order History</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        Enter a location name to search through previous work orders
      </p>
    </div>
  );

  const NoResultsState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Search className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No orders found</h3>
      <p className="text-muted-foreground mt-2">
        No work orders match "{searchQuery}"
      </p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={() => handleSearch("")}
      >
        Clear search
      </Button>
    </div>
  );

  // Custom actions menu specifically for technician view
  const handleOrderImageView = (workOrderId: string) => {
    console.log(`View images for order: ${workOrderId}`);
    // This would be implemented to view images without QC actions
  };
  
  const handleAddNotes = (workOrderId: string) => {
    handleOpenNoteDialog(workOrderId);
  };
  
  // Empty function for delete as we may not need this for techs
  const handleDelete = () => {};

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <SearchBar 
              initialValue={searchQuery} 
              onSearch={handleSearch}
              placeholder="Search by location name..." 
            />
          </div>
          
          {isLoading ? (
            <LoadingSkeleton />
          ) : searchResults.length > 0 ? (
            <WorkOrderTable 
              workOrders={searchResults}
              onStatusUpdate={() => {}} // No-op as techs don't change status
              onImageView={handleOrderImageView}
              onDelete={handleDelete}
              filters={{
                status: null,
                dateRange: { from: null, to: null },
                driver: null,
                location: null,
                orderNo: null,
                optimoRouteStatus: null
              }}
              onColumnFilterChange={() => {}}
              onColumnFilterClear={() => {}}
              onClearAllFilters={() => {}}
            />
          ) : noResults ? (
            <NoResultsState />
          ) : (
            <EmptySearchState />
          )}
        </CardContent>
      </Card>
      
      {/* Notes Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Technician Notes</DialogTitle>
            <DialogDescription>
              Leave notes about this location for future service visits. Include any safety concerns or special instructions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="Enter notes here..." 
              className="min-h-[200px]"
              value={techNote}
              onChange={(e) => setTechNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsNoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveNote}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
