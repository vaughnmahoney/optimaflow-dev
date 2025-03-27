
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import WorkOrders from "@/pages/WorkOrders";
import BulkOrdersTest from "@/pages/BulkOrdersTest";
import BulkOrdersProgressive from "@/pages/BulkOrdersProgressive";
import MaterialRequirements from "@/pages/MaterialRequirements";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="work-orders" element={<WorkOrders />} />
      <Route path="bulk-orders" element={<BulkOrdersTest />} />
      <Route path="material-requirements" element={<MaterialRequirements />} />
      <Route path="bulk-orders-progressive" element={<BulkOrdersProgressive />} />
    </Routes>
  );
};

export default AppRoutes;
