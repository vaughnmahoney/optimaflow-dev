
/**
 * Safely parses JSON data or returns the original if it's already an object
 */
export const safelyParseJSON = (jsonData: any): any => {
  if (!jsonData) return null;
  
  if (typeof jsonData === 'string') {
    try {
      return JSON.parse(jsonData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  }
  
  // If it's already an object, return it as is
  return jsonData;
};
