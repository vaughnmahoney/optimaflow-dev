
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MRHeader } from "./MRHeader";
import { MRRouteImport } from "./MRRouteImport";
import { MRDriverList } from "./MRDriverList";
import { MRSummary } from "./MRSummary";
import { useMRStore } from "@/store/useMRStore";

export const MaterialRequirements = () => {
  const [isGeneratingMR, setIsGeneratingMR] = useState(false);
  const materialStats = useMRStore(state => state.materialStats);
  const selectedDrivers = useMRStore(state => state.selectedDrivers);
  const drivers = useMRStore(state => state.drivers);
  const selectAllDrivers = useMRStore(state => state.selectAllDrivers);
  const materialItems = useMRStore(state => state.materialItems);
  
  // Handle generating material requirements
  const handleGenerateMR = () => {
    if (selectedDrivers.length === 0) {
      // If no drivers selected, prompt to select all
      selectAllDrivers(true);
    }
    
    setIsGeneratingMR(true);
  };
  
  // Handle closing the MR summary
  const handleCloseMR = () => {
    setIsGeneratingMR(false);
  };

  return (
    <div className="space-y-6">
      <MRHeader />
      
      {/* Route Import Section */}
      <Card>
        <CardContent className="p-6">
          <MRRouteImport />
        </CardContent>
      </Card>
      
      {materialItems.length > 0 && (
        <>
          {/* Stats Summary */}
          <div className="bg-slate-50 p-4 rounded-md border">
            <div className="text-sm font-medium">
              Summary: Total Work Orders: {materialStats.totalWorkOrders} | 
              Total Technicians: {materialStats.totalTechnicians} |
              Total Filters Needed: {materialStats.totalFilters}
            </div>
          </div>
          
          {/* Driver List Section */}
          <Card>
            <CardContent className="p-6">
              <MRDriverList 
                onGenerateMR={handleGenerateMR} 
              />
            </CardContent>
          </Card>
          
          {/* Material Requirements Summary (conditionally shown) */}
          {isGeneratingMR && (
            <Card>
              <CardContent className="p-6">
                <MRSummary 
                  onClose={handleCloseMR}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
