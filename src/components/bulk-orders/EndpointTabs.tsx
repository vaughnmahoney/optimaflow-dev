
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EndpointTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const EndpointTabs = ({ activeTab, onTabChange }: EndpointTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search-only">Search Only</TabsTrigger>
        <TabsTrigger value="with-completion">With Completion Details</TabsTrigger>
      </TabsList>
      <TabsContent value="search-only" className="mt-2 text-sm text-muted-foreground">
        Uses search_orders endpoint to retrieve basic order data by date range.
      </TabsContent>
      <TabsContent value="with-completion" className="mt-2 text-sm text-muted-foreground">
        Uses search_orders + get_completion_details to retrieve full order data including images.
      </TabsContent>
    </Tabs>
  );
};
