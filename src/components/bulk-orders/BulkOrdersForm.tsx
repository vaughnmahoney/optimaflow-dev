
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "./DateRangePicker";
import { EndpointTabs } from "./EndpointTabs";
import { FetchButton } from "./FetchButton";

interface BulkOrdersFormProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  isLoading: boolean;
  onFetchOrders: () => void;
}

export const BulkOrdersForm = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  activeTab,
  onTabChange,
  isLoading,
  onFetchOrders,
}: BulkOrdersFormProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Test Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <EndpointTabs 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
        />
        
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
        
        <FetchButton 
          isLoading={isLoading} 
          disabled={isLoading || !startDate || !endDate}
          onClick={onFetchOrders}
          activeTab={activeTab}
        />
      </CardContent>
    </Card>
  );
};
