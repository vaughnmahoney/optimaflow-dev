
import React, { useState } from "react";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { SearchBar } from "./search/SearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { History, Search, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TechWorkOrderRow } from "./table/TechWorkOrderRow";
import { TechWorkOrderCard } from "./table/TechWorkOrderCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TechImageViewModal } from "./modal/TechImageViewModal";

export const OrderHistoryContent = () => {
  const { searchResults, isLoading, noResults, searchByLocation } = useLocationSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [techNote, setTechNote] = useState("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const isMobile = useIsMobile();
  
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

  const handleOrderImageView = (workOrderId: string) => {
    setSelectedOrderId(workOrderId);
    setIsImageViewerOpen(true);
  };
  
  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
  };
  
  // Get the currently selected work order
  const selectedWorkOrder = searchResults.find(order => order.id === selectedOrderId) || null;

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

  // Render grid for mobile or table for desktop
  const renderWorkOrders = () => {
    if (isMobile) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((workOrder) => (
            <TechWorkOrderCard
              key={workOrder.id}
              workOrder={workOrder}
              onImageView={handleOrderImageView}
              onAddNotes={handleOpenNoteDialog}
            />
          ))}
        </div>
      );
    } else {
      return (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchResults.map((workOrder) => (
                <TechWorkOrderRow
                  key={workOrder.id}
                  workOrder={workOrder}
                  onImageView={handleOrderImageView}
                  onAddNotes={handleOpenNoteDialog}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
  };

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
            renderWorkOrders()
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
      
      {/* Image View Modal */}
      <TechImageViewModal
        workOrder={selectedWorkOrder}
        isOpen={isImageViewerOpen}
        onClose={closeImageViewer}
      />
    </div>
  );
};
