
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
        <TabsTrigger value="with-completion">Completed &amp; Failed Orders</TabsTrigger>
      </TabsList>
      <TabsContent value="search-only" className="mt-2 text-sm text-muted-foreground">
        Uses search_orders endpoint to retrieve all orders by date range. Supports pagination for retrieving more than 500 orders using the API's after_tag parameter.
      </TabsContent>
      <TabsContent value="with-completion" className="mt-2 text-sm text-muted-foreground">
        Uses search_orders + get_completion_details to retrieve orders with completion details. Shows orders with status "success" or "failed" that have been attempted (has start/end times). Includes tracking URLs and completion details.
      </TabsContent>
    </Tabs>
  );
};
