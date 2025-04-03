
import { WorkOrder } from "../../../types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MobileDetailsTab } from "./tabs/MobileDetailsTab";
import { MobileNotesTab } from "./tabs/MobileNotesTab";
import { MobileSignatureTab } from "./tabs/MobileSignatureTab";
import { useRef, useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileOrderDetailsProps {
  workOrder: WorkOrder;
}

export const MobileOrderDetails = ({
  workOrder
}: MobileOrderDetailsProps) => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState("details");
  
  // Create refs for each section to scroll to
  const detailsSectionRef = useRef<HTMLDivElement>(null);
  const notesSectionRef = useRef<HTMLDivElement>(null);
  const signatureSectionRef = useRef<HTMLDivElement>(null);
  
  // Handle scrolling to the appropriate section when a tab is clicked
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    switch (value) {
      case "details":
        detailsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "notes":
        notesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "signature":
        signatureSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
    }
  };

  // Set up intersection observers for each section
  useEffect(() => {
    const options = {
      root: null, // Use the viewport as the root
      rootMargin: "0px",
      threshold: 0.3 // Trigger when 30% of the element is visible
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        // Only process elements that are intersecting (visible)
        if (entry.isIntersecting) {
          const id = entry.target.id;
          
          // Update the active tab based on which section is visible
          if (id === "mobile-details-section") {
            setActiveTab("details");
          } else if (id === "mobile-notes-section") {
            setActiveTab("notes");
          } else if (id === "mobile-signature-section") {
            setActiveTab("signature");
          }
        }
      });
    };

    // Create the observer
    const observer = new IntersectionObserver(handleIntersect, options);
    
    // Observe all three sections
    if (detailsSectionRef.current) {
      observer.observe(detailsSectionRef.current);
    }
    if (notesSectionRef.current) {
      observer.observe(notesSectionRef.current);
    }
    if (signatureSectionRef.current) {
      observer.observe(signatureSectionRef.current);
    }

    // Clean up the observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex-shrink-0">
        <TabsList className="grid grid-cols-3 w-full bg-gradient-to-b from-white to-gray-100 shadow-sm rounded-none px-1 py-1.5 sticky top-0 z-10">
          <TabsTrigger 
            value="details" 
            className="text-sm rounded-md bg-white/80 shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            Details
          </TabsTrigger>
          <TabsTrigger 
            value="notes" 
            className="text-sm rounded-md bg-white/80 shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            Notes
          </TabsTrigger>
          <TabsTrigger 
            value="signature" 
            className="text-sm rounded-md bg-white/80 shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            Signature
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Scrollable content with all sections */}
      <ScrollArea className="flex-1 overflow-auto">
        <div className="space-y-4 py-2">
          {/* Details Section */}
          <div id="mobile-details-section" ref={detailsSectionRef} className="scroll-m-12">
            <MobileDetailsTab workOrder={workOrder} />
          </div>
          
          {/* Notes Section */}
          <div id="mobile-notes-section" ref={notesSectionRef} className="scroll-m-12">
            <MobileNotesTab workOrder={workOrder} />
          </div>
          
          {/* Signature Section */}
          <div id="mobile-signature-section" ref={signatureSectionRef} className="scroll-m-12">
            <MobileSignatureTab workOrder={workOrder} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
