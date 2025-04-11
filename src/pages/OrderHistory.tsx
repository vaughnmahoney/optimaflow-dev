
import React from "react";
import { Layout } from "@/components/Layout";
import { OrderHistoryContent } from "@/components/workorders/OrderHistoryContent";

const OrderHistory = () => {
  return (
    <Layout title="Order History">
      <OrderHistoryContent />
    </Layout>
  );
};

export default OrderHistory;
