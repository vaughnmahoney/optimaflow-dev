
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
      <div className="flex justify-between items-center mb-2">
        {/* Left side placeholder for alignment */}
        <div className="w-24 flex justify-start">
          {/* No flag button */}
        </div>
        
        {/* Center: Images text */}
        <span className="font-medium">Order History</span>
        
        {/* Right side: Close button with fixed width */}
        <div className="w-24 flex justify-end pr-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-9 bg-gray-100">
          <TabsTrigger value="images" className="text-xs py-1.5">Images</TabsTrigger>
          <TabsTrigger value="notes" className="text-xs py-1.5">Notes</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
