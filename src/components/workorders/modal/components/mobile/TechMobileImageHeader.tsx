
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TechMobileImageHeaderProps {
  onClose: () => void;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const TechMobileImageHeader = ({ 
  onClose, 
  activeTab,
  onTabChange 
}: TechMobileImageHeaderProps) => {
  return (
    <div className="p-3 flex flex-col border-b bg-white">
      {/* Top row with title and close button */}
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-base">Work Order Details</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Tab navigation */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
