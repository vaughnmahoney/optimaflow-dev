
/**
 * Extracts location information from various possible locations in the order data
 */
export const extractLocationInfo = (order: any, searchData: any): {
  name: string,
  address: string | null,
  city: string | null,
  state: string | null,
  zip: string | null
} => {
  let locationName = 'N/A';
  let locationObj: any = {};
  
  // First try direct location object in searchData
  if (searchData.location) {
    if (typeof searchData.location === 'object') {
      locationObj = searchData.location;
      locationName = searchData.location.name || 
                    searchData.location.locationName || 
                    'N/A';
    } else if (typeof searchData.location === 'string') {
      locationName = searchData.location;
    }
  } 
  // Try alternate location paths
  else if (searchData.locationName) {
    locationName = searchData.locationName;
  } 
  else if (searchData.location_name) {
    locationName = searchData.location_name;
  }
  // Try location in the order root
  else if (order.location) {
    if (typeof order.location === 'object') {
      locationObj = order.location;
      locationName = order.location.name ||
                     order.location.locationName ||
                     'N/A';
    } else if (typeof order.location === 'string') {
      locationName = order.location;
    }
  }
  // Try extracting location from customer data if available
  else if (searchData.customer && typeof searchData.customer === 'object') {
    locationName = searchData.customer.name || 'N/A';
    // Check if customer object has location info
    if (searchData.customer.location && typeof searchData.customer.location === 'object') {
      locationObj = searchData.customer.location;
    }
  }
  
  // Build location object with all available details
  return {
    name: locationName,
    address: locationObj.address || searchData.address || order.address || null,
    city: locationObj.city || searchData.city || order.city || null,
    state: locationObj.state || searchData.state || order.state || null,
    zip: locationObj.zip || searchData.zip || order.zip || null,
  };
};
