
import { format } from "date-fns";

export const getStatusBorderColor = (status: string) => {
  switch (status) {
    case "approved":
      return "border-green-500";
    case "flagged":
    case "flagged_followup":
      return "border-red-500";
    case "resolved":
      return "border-blue-500";
    case "rejected":
      return "border-orange-500";
    case "pending_review":
    default:
      return "border-yellow-500";
  }
};

export const getStatusBgColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-50";
    case "flagged":
    case "flagged_followup":
      return "bg-red-50";
    case "resolved":
      return "bg-blue-50";
    case "rejected":
      return "bg-orange-50";
    case "pending_review":
    default:
      return "bg-yellow-50";
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

// Get formatted status name for display
export const getFormattedStatus = (status: string): string => {
  switch (status) {
    case "approved":
      return "Approved";
    case "flagged":
    case "flagged_followup":
      return "Flagged";
    case "resolved":
      return "Resolved";
    case "pending_review":
      return "Pending Review";
    case "rejected":
      return "Rejected";
    default:
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};
