
import React from 'react';
import { Check, FileBarChart, FileText, BarChart2, Clock, Users } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export const REPORT_TYPES: ReportType[] = [
  {
    id: 'work-orders',
    name: 'Work Orders Status',
    description: 'Overview of work order completion status and metrics',
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 'tech-performance',
    name: 'Technician Performance',
    description: 'Analyze technician efficiency and work patterns',
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'service-duration',
    name: 'Service Duration',
    description: 'Average service duration by location and technician',
    icon: <Clock className="h-5 w-5" />
  },
  {
    id: 'customer-analytics',
    name: 'Customer Analytics',
    description: 'Service metrics broken down by customer and group',
    icon: <BarChart2 className="h-5 w-5" />
  },
  {
    id: 'custom-report',
    name: 'Custom Report',
    description: 'Build a report with your specific metrics',
    icon: <FileBarChart className="h-5 w-5" />
  }
];

interface ReportTypesStepProps {
  selectedReportTypes: string[];
  setSelectedReportTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ReportTypesStep: React.FC<ReportTypesStepProps> = ({
  selectedReportTypes,
  setSelectedReportTypes
}) => {
  const toggleReportType = (id: string) => {
    setSelectedReportTypes(prev => 
      prev.includes(id) 
        ? prev.filter(type => type !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Report Types</h3>
      <p className="text-sm text-muted-foreground">
        Choose one or more report types to generate
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {REPORT_TYPES.map((reportType) => {
          const isSelected = selectedReportTypes.includes(reportType.id);
          
          return (
            <Card 
              key={reportType.id}
              className={cn(
                "cursor-pointer transition-all border-2",
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => toggleReportType(reportType.id)}
            >
              <CardContent className="p-4 flex items-start space-x-4">
                <div className={cn(
                  "mt-1 p-2 rounded-md",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {reportType.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{reportType.name}</h4>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {reportType.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
