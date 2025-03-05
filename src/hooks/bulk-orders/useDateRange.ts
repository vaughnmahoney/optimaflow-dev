
/**
 * Custom hook for managing date range state
 */
import { useState } from "react";

export const useDateRange = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    hasValidDateRange: !!startDate && !!endDate
  };
};
