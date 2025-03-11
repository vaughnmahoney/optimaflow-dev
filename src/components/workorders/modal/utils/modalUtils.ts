
import { format } from "date-fns";

export const getStatusBorderColor = (status: string) => {
  switch (status) {
    case "approved":
      return "border-green-500";
    case "flagged":
    case "flagged_followup":
      return "border-red-500";
    case "resolved":
      return "border-purple-500";
    case "pending_review":
    default:
      return "border-yellow-500";
  }
};

export const formatDate = (dateStr?: string, formatString: string = "EEEE, MMMM d, yyyy") => {
  if (!dateStr) return 'N/A';
  try {
    return format(new Date(dateStr), formatString);
  } catch {
    return 'Invalid Date';
  }
};

export const calculateDuration = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return "N/A";
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  } catch {
    return "N/A";
  }
};

// Helper to add visual indication to status buttons
export const getStatusButtonStyle = (currentStatus: string, buttonStatus: string) => {
  const isActive = currentStatus === buttonStatus;
  
  switch (buttonStatus) {
    case "approved":
      return isActive 
        ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300" 
        : "bg-green-500 hover:bg-green-600 text-white";
    case "flagged":
      return isActive 
        ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300" 
        : "bg-red-500 hover:bg-red-600 text-white";
    case "resolved":
      return isActive 
        ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300" 
        : "bg-purple-500 hover:bg-purple-600 text-white";
    default:
      return "bg-gray-500 hover:bg-gray-600 text-white";
  }
};
