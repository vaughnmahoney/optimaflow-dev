
import { useRef, useState, useEffect } from "react";
import { NotesTab } from "../tabs/NotesTab";
import { SignatureTab } from "../tabs/SignatureTab";
import { WorkOrder } from "../../types";
import { FileText, MessageSquare, FileSignature } from "lucide-react";
import { QcNotesSheet } from "./QcNotesSheet";
import { ResolutionNotesSheet } from "./ResolutionNotesSheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderDetailsTab } from "../tabs/OrderDetailsTab";

interface OrderDetailsProps {
  workOrder: WorkOrder;
}

export const OrderDetails = ({
  workOrder
}: OrderDetailsProps) => {
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
      rootMargin: "-50px 0px", // Negative margin to trigger a bit before the element reaches the top
      threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        // Only process elements that are intersecting (visible)
        if (entry.isIntersecting) {
          const id = entry.target.id;
          
          // Update the active tab based on which section is visible
          if (id === "details-section") {
            setActiveTab("details");
          } else if (id === "notes-section") {
            setActiveTab("notes");
          } else if (id === "signature-section") {
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
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full h-12 bg-white grid grid-cols-3 rounded-none border-b border-gray-200">
            <TabsTrigger 
              value="details" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-700 data-[state=active]:bg-transparent"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-sm hidden sm:inline font-medium">Details</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-700 data-[state=active]:bg-transparent"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-600" />
                <span className="text-sm hidden sm:inline font-medium">Notes</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="signature" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-700 data-[state=active]:bg-transparent"
            >
              <div className="flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-gray-600" />
                <span className="text-sm hidden sm:inline font-medium">Signature</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        <div className="space-y-0">
          {/* Order Details Section */}
          <div id="details-section" ref={detailsSectionRef} className="scroll-m-12">
            <OrderDetailsTab workOrder={workOrder} />
          </div>
          
          {/* Notes Section */}
          <div id="notes-section" ref={notesSectionRef} className="scroll-m-12">
            <NotesTab workOrder={workOrder} />
          </div>
          
          {/* Signature Section */}
          <div id="signature-section" ref={signatureSectionRef} className="scroll-m-12">
            <SignatureTab workOrder={workOrder} />
          </div>
        </div>
      </ScrollArea>
      
      {/* Footer with notes buttons */}
      <div className="p-3 border-t flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <QcNotesSheet workOrder={workOrder} />
          <ResolutionNotesSheet workOrder={workOrder} />
        </div>
        
        <div></div> {/* Empty div for spacing */}
      </div>
    </div>
  );
};
