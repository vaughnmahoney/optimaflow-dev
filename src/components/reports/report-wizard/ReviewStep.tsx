
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { CalendarDays, Users, Building, FileBarChart } from 'lucide-react';

interface ReviewStepProps {
  selectedReportTypes: string[];
  dateRange: DateRange | undefined;
  selectedDrivers: string[];
  selectedCustomerGroups: string[];
  selectedCustomerNames: string[];
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  selectedReportTypes,
  dateRange,
  selectedDrivers,
  selectedCustomerGroups,
  selectedCustomerNames
}) => {
  // Map report types to readable names
  const reportTypeLabels: Record<string, string> = {
    'work-orders': 'Work Orders Status',
    'tech-performance': 'Technician Performance',
    'service-duration': 'Service Duration',
    'customer-analytics': 'Customer Analytics',
    'custom-report': 'Custom Report'
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Review Your Selections</h3>
      <p className="text-sm text-muted-foreground">
        Confirm your report configuration before generating
      </p>
      
      <div className="grid grid-cols-1 gap-4 mt-4">
        {/* Report types */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="bg-muted p-2 rounded-md mt-1">
                <FileBarChart className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Report Types</h4>
                <div className="space-y-1">
                  {selectedReportTypes.length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {selectedReportTypes.map(type => (
                        <li key={type} className="text-muted-foreground">
                          {reportTypeLabels[type] || type}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No report types selected</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Date range */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="bg-muted p-2 rounded-md mt-1">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Date Range</h4>
                {dateRange?.from ? (
                  <div className="text-sm text-muted-foreground">
                    <p>{format(dateRange.from, "MMMM d, yyyy")}</p>
                    {dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime() && (
                      <p>to {format(dateRange.to, "MMMM d, yyyy")}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No date range selected</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Drivers */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="bg-muted p-2 rounded-md mt-1">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Technicians</h4>
                {selectedDrivers.length > 0 ? (
                  <div className="text-sm text-muted-foreground">
                    {selectedDrivers.length > 3 ? (
                      <p>{selectedDrivers.length} technicians selected</p>
                    ) : (
                      <ul className="space-y-1">
                        {selectedDrivers.map(driver => (
                          <li key={driver}>{driver}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">All technicians</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Customers */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="bg-muted p-2 rounded-md mt-1">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Customers</h4>
                <div className="space-y-2">
                  {/* Customer Groups */}
                  {selectedCustomerGroups.length > 0 ? (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-xs">Groups:</p>
                      {selectedCustomerGroups.length > 3 ? (
                        <p>{selectedCustomerGroups.length} groups selected</p>
                      ) : (
                        <ul className="ml-2 space-y-1">
                          {selectedCustomerGroups.map(group => (
                            <li key={group}>{group}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                  
                  {/* Individual Customers */}
                  {selectedCustomerNames.length > 0 ? (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-xs">Individual Customers:</p>
                      {selectedCustomerNames.length > 3 ? (
                        <p>{selectedCustomerNames.length} customers selected</p>
                      ) : (
                        <ul className="ml-2 space-y-1">
                          {selectedCustomerNames.map(customer => (
                            <li key={customer}>{customer}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                  
                  {selectedCustomerGroups.length === 0 && selectedCustomerNames.length === 0 && (
                    <p className="text-sm text-muted-foreground">All customers</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
