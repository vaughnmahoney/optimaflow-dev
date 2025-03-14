
export const transformResponse = (response: any) => {
  if (!response?.orders?.[0]) return null;
  
  const order = response.orders[0];
  return {
    Order: {
      ID: order.id,
      Number: order.data?.orderNo || order.id,
      Status: order.data?.status,
      Date: order.data?.date,
    },
    Location: {
      Name: order.data?.location?.name,
      Address: order.data?.location?.address,
      Coordinates: order.data?.location?.coordinates,
    },
    ServiceDetails: {
      Notes: order.data?.notes,
      Description: order.data?.serviceDescription,
      CustomFields: order.data?.customFields,
    },
    CompletionInfo: {
      Status: response.completion_data?.status,
      Images: response.completion_data?.photos?.length || 0,
      HasSignature: response.completion_data?.signatures?.length > 0,
      Notes: response.completion_data?.notes,
    },
    Schedule: order.scheduleInformation
  };
};
