
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

// New utility functions for status styling
export const getStatusColors = (status: string) => {
  switch (status) {
    case "approved":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200"
      };
    case "flagged":
    case "flagged_followup":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200"
      };
    case "resolved":
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200"
      };
    case "pending_review":
    default:
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200"
      };
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "approved":
      return "APPROVED";
    case "flagged":
      return "FLAGGED";
    case "flagged_followup":
      return "FLAGGED (FOLLOWUP)";
    case "resolved":
      return "RESOLVED";
    case "pending_review":
      return "PENDING";
    default:
      return status.replace(/_/g, " ").toUpperCase();
  }
};
