
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import WorkOrders from "@/pages/WorkOrders";
import BulkOrdersTest from "@/pages/BulkOrdersTest";
import MaterialRequirements from "@/pages/MaterialRequirements";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="work-orders" element={<WorkOrders />} />
      {/* Using only the simplified progressive loading version */}
      <Route path="bulk-orders" element={<BulkOrdersTest />} />
      <Route path="material-requirements" element={<MaterialRequirements />} />
      {/* Removed duplicate route for bulk-orders-progressive as it's now redundant */}
    </Routes>
  );
};

export default AppRoutes;
