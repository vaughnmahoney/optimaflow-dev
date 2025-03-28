
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EndpointTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const EndpointTabs = ({ activeTab, onTabChange }: EndpointTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
      <TabsList>
        <TabsTrigger value="with-completion">With Completion</TabsTrigger>
        <TabsTrigger value="search-only">Search Only</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
