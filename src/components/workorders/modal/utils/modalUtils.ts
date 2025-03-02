
import { format, formatDistance } from "date-fns";
import { Location } from "@/components/workorders/types";

// Format a date string with a specific format
export const formatDate = (dateString?: string, formatStr: string = "MMM d, yyyy") => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

// Calculate duration between two date strings
export const calculateDuration = (startDateStr?: string, endDateStr?: string) => {
  if (!startDateStr || !endDateStr) return "N/A";
  
  try {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    return formatDistance(startDate, endDate, { addSuffix: false });
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "N/A";
  }
};

// Format address from location object
export const formatAddress = (location?: Location) => {
  if (!location) return "";
  
  const addressParts = [];
  if (location.address) addressParts.push(location.address);
  if (location.city) addressParts.push(location.city);
  if (location.state) addressParts.push(location.state);
  if (location.zip) addressParts.push(location.zip);
  
  return addressParts.join(', ');
};
