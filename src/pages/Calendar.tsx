
// src/pages/Calendar.tsx
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Month, Year, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "year">("month");

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <Layout title="Calendar">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Calendar</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleTodayClick}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-muted-foreground font-medium mt-2">
              {format(currentMonth, "MMMM yyyy")}
            </div>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              selected={selectedDate}
              onSelect={handleDateSelect}
              defaultMonth={currentMonth}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Calendar;
