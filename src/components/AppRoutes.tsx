
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Home } from "@/pages/Index";
import { WorkOrders } from "@/pages/WorkOrders";
import BulkOrdersTest from "@/pages/BulkOrdersTest";
import MaterialsRequest from "@/pages/MaterialsRequest";
import BulkOrdersProgressive from "@/pages/BulkOrdersProgressive";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="bulk-orders" element={<BulkOrdersTest />} />
        <Route path="materials-request" element={<MaterialsRequest />} />
        <Route path="bulk-orders-progressive" element={<BulkOrdersProgressive />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
