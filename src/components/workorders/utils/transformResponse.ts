
export const transformResponse = (response: any) => {
  if (!response?.orders?.[0]) return null;
  
  const order = response.orders[0];
  return {
    Order: {
      ID: order.id,
      Number: order.orderNo || order.id,
      Status: order.status,
      Date: order.date,
    },
    Location: {
      Name: order.location?.name,
      Address: order.location?.address,
      Coordinates: order.location?.coordinates,
    },
    ServiceDetails: {
      Notes: order.notes,
      Description: order.serviceDescription,
      CustomFields: order.customFields,
    },
    CompletionInfo: {
      Status: response.completion_data?.status,
      Images: response.completion_data?.photos?.length || 0,
      HasSignature: response.completion_data?.signatures?.length > 0,
      Notes: response.completion_data?.notes,
    }
  };
};
