
import { useRef, useState, useEffect } from "react";
import { OrderDetailsTab } from "../tabs/OrderDetailsTab";
import { NotesTab } from "../tabs/NotesTab";
import { SignatureTab } from "../tabs/SignatureTab";
import { WorkOrder } from "../../types";
import { FileText, MessageSquare, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QcNotesSheet } from "./QcNotesSheet";
import { ResolutionNotesSheet } from "./ResolutionNotesSheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <div className="bg-gray-100 sticky top-0 z-10">
        <div className="w-full bg-gray-100 flex items-center justify-center">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full h-12 bg-gray-100 grid grid-cols-3 rounded-none">
              <TabsTrigger value="details" className="rounded-none data-[state=active]:bg-white">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Order Details</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-none data-[state=active]:bg-white">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Notes</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="signature" className="rounded-none data-[state=active]:bg-white">
                <div className="flex items-center gap-2">
                  <FileSignature className="h-4 w-4" />
                  <span className="hidden sm:inline">Signature</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        <div className="space-y-4 pt-4">
          {/* Order Details Section */}
          <div id="details-section" ref={detailsSectionRef} className="px-4 pb-6 scroll-m-12">
            <OrderDetailsTab workOrder={workOrder} />
          </div>
          
          {/* Notes Section */}
          <div id="notes-section" ref={notesSectionRef} className="px-4 pb-6 scroll-m-12">
            <NotesTab workOrder={workOrder} />
          </div>
          
          {/* Signature Section */}
          <div id="signature-section" ref={signatureSectionRef} className="px-4 pb-6 scroll-m-12">
            <SignatureTab workOrder={workOrder} />
          </div>
        </div>
      </ScrollArea>
      
      {/* Footer with notes buttons */}
      <div className="p-4 border-t flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <QcNotesSheet workOrder={workOrder} />
          <ResolutionNotesSheet workOrder={workOrder} />
        </div>
        
        <div></div> {/* Empty div for spacing */}
      </div>
    </div>
  );
};
