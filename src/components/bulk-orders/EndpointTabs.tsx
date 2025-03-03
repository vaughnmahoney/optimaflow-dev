
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EndpointTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const EndpointTabs = ({ activeTab, onTabChange }: EndpointTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search-only">All Orders</TabsTrigger>
        <TabsTrigger value="with-completion">Completed Orders Only</TabsTrigger>
      </TabsList>
      <TabsContent value="search-only" className="mt-2 text-sm text-muted-foreground">
        Uses search_orders endpoint to retrieve all orders by date range. Will paginate through results to get more than 500 orders.
      </TabsContent>
      <TabsContent value="with-completion" className="mt-2 text-sm text-muted-foreground">
        Uses search_orders + get_completion_details to retrieve and filter only successfully completed orders for QC review. Handles pagination for large date ranges.
      </TabsContent>
    </Tabs>
  );
};
