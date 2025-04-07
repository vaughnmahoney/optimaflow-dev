
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TimeRange } from "@/hooks/useJobsCompletedStats";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DownloadIcon, FilterIcon, CalendarIcon, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface JobsCompletedDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

interface TechnicianJobStats {
  techName: string;
  jobsCompleted: number;
  avgTimeMinutes: number;
  flagCount: number;
  attendancePercent: number;
  region: string;
}

export const JobsCompletedDetailView = ({
  isOpen,
  onClose,
  timeRange,
  onTimeRangeChange
}: JobsCompletedDetailViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [technicianStats, setTechnicianStats] = useState<TechnicianJobStats[]>([]);
  const [filteredStats, setFilteredStats] = useState<TechnicianJobStats[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [totalStats, setTotalStats] = useState({
    totalJobs: 0,
    avgTime: 0,
    flagRate: 0
  });

  // Fetch technician job statistics
  const fetchTechnicianJobStats = async () => {
    setIsLoading(true);
    
    try {
      // This is simplified - in a real implementation we would fetch actual data from the database
      // For demo purposes, we're generating mock data
      const mockData: TechnicianJobStats[] = [
        { techName: "J. Smith", jobsCompleted: 22, avgTimeMinutes: 30, flagCount: 2, attendancePercent: 100, region: "West" },
        { techName: "L. Garcia", jobsCompleted: 18, avgTimeMinutes: 34, flagCount: 0, attendancePercent: 97, region: "East" },
        { techName: "T. Adams", jobsCompleted: 15, avgTimeMinutes: 29, flagCount: 1, attendancePercent: 92, region: "Central" },
        { techName: "K. Johnson", jobsCompleted: 14, avgTimeMinutes: 31, flagCount: 3, attendancePercent: 95, region: "West" },
        { techName: "M. Williams", jobsCompleted: 13, avgTimeMinutes: 33, flagCount: 1, attendancePercent: 100, region: "East" },
        { techName: "R. Davis", jobsCompleted: 12, avgTimeMinutes: 28, flagCount: 0, attendancePercent: 98, region: "Central" },
        { techName: "S. Martin", jobsCompleted: 11, avgTimeMinutes: 35, flagCount: 4, attendancePercent: 90, region: "West" },
        { techName: "D. Thompson", jobsCompleted: 10, avgTimeMinutes: 32, flagCount: 1, attendancePercent: 96, region: "East" },
        { techName: "A. Wilson", jobsCompleted: 9, avgTimeMinutes: 30, flagCount: 0, attendancePercent: 100, region: "Central" },
        { techName: "B. Anderson", jobsCompleted: 10, avgTimeMinutes: 27, flagCount: 2, attendancePercent: 94, region: "West" },
      ];
      
      setTechnicianStats(mockData);
      setFilteredStats(mockData);
      
      // Calculate totals
      const totalJobs = mockData.reduce((sum, tech) => sum + tech.jobsCompleted, 0);
      const totalTime = mockData.reduce((sum, tech) => sum + (tech.avgTimeMinutes * tech.jobsCompleted), 0);
      const totalFlags = mockData.reduce((sum, tech) => sum + tech.flagCount, 0);
      
      setTotalStats({
        totalJobs,
        avgTime: totalJobs > 0 ? Math.round(totalTime / totalJobs) : 0,
        flagRate: totalJobs > 0 ? (totalFlags / totalJobs) * 100 : 0
      });
      
      // Set date range based on timeRange
      setDateRange(getDateRangeFromTimeRange(timeRange));
      
    } catch (error) {
      console.error("Error fetching technician job statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply filters when region selection changes
  useEffect(() => {
    if (selectedRegion === "all") {
      setFilteredStats(technicianStats);
    } else {
      setFilteredStats(technicianStats.filter(tech => tech.region === selectedRegion));
    }
  }, [selectedRegion, technicianStats]);
  
  // Fetch data when dialog opens or timeRange changes
  useEffect(() => {
    if (isOpen) {
      fetchTechnicianJobStats();
    }
  }, [isOpen, timeRange]);
  
  // Helper function to get date range from time range
  const getDateRangeFromTimeRange = (range: TimeRange) => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);
    
    switch (range) {
      case "today":
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
        
      case "week":
        start = new Date(now);
        const dayOfWeek = start.getDay();
        const diff = start.getDate() - dayOfWeek;
        start = new Date(start.setDate(diff));
        start.setHours(0, 0, 0, 0);
        break;
        
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
        
      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
    }
    
    return {
      start: format(start, 'MMM d, yyyy'),
      end: format(end, 'MMM d, yyyy')
    };
  };
  
  // Export functions
  const handleExportCSV = () => {
    // Implementation would export the current filtered data as CSV
    console.log("Exporting CSV...");
  };
  
  const handleExportPDF = () => {
    // Implementation would export the current filtered data as PDF
    console.log("Exporting PDF...");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Jobs Completed by Technician – {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Showing all technicians and jobs completed between {dateRange.start} and {dateRange.end}
          </DialogDescription>
        </DialogHeader>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="flex items-center gap-2">
            <Tabs 
              value={timeRange} 
              onValueChange={(value) => onTimeRangeChange(value as TimeRange)}
              className="w-fit"
            >
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="quarter">Quarter</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Select
              value={selectedRegion}
              onValueChange={setSelectedRegion}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="West">West</SelectItem>
                <SelectItem value="East">East</SelectItem>
                <SelectItem value="Central">Central</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleExportCSV} className="gap-1">
              <DownloadIcon className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="gap-1">
              <DownloadIcon className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
        
        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Technician</TableHead>
                    <TableHead>Jobs Completed</TableHead>
                    <TableHead>Avg Time per Job</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Attendance %</TableHead>
                    <TableHead>Region</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStats.map((tech, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{tech.techName}</TableCell>
                      <TableCell>{tech.jobsCompleted}</TableCell>
                      <TableCell>{tech.avgTimeMinutes} min</TableCell>
                      <TableCell className={tech.flagCount >= 3 ? "text-red-500 font-medium" : ""}>
                        {tech.flagCount}
                      </TableCell>
                      <TableCell>{tech.attendancePercent}%</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                          ${tech.region === "West" ? "bg-blue-100 text-blue-800" : 
                           tech.region === "East" ? "bg-green-100 text-green-800" : 
                           "bg-purple-100 text-purple-800"}`}>
                          {tech.region}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Table Footer */}
            <div className="text-sm text-muted-foreground mt-4 flex items-center justify-between">
              <div>
                Total Jobs: {totalStats.totalJobs} | Avg Time: {totalStats.avgTime} mins | Flag Rate: {totalStats.flagRate.toFixed(1)}%
              </div>
              <div>
                Showing {filteredStats.length} of {technicianStats.length} technicians
              </div>
            </div>
          </>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
