
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import WorkOrders from "@/pages/WorkOrders";
import BulkOrdersTest from "@/pages/BulkOrdersTest";
import BulkOrdersProgressive from "@/pages/BulkOrdersProgressive";
import MaterialRequirements from "@/pages/MaterialRequirements";
import Login from "@/pages/Login";
import Users from "@/pages/Users";
import Reports from "@/pages/Reports";
import CalendarPage from "@/pages/Calendar"; // Changed from @/pages/CalendarPage
import OrderDetailsPage from "@/components/workorders/detail/OrderDetailsPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="login" element={<Login />} />
      <Route path="work-orders" element={<WorkOrders />} />
      <Route path="order/:orderNo" element={<OrderDetailsPage />} />
      <Route path="bulk-orders" element={<BulkOrdersTest />} />
      <Route path="material-requirements" element={<MaterialRequirements />} />
      <Route path="bulk-orders-progressive" element={<BulkOrdersProgressive />} />
      <Route path="users" element={<Users />} />
      <Route path="reports" element={<Reports />} />
      <Route path="calendar" element={<CalendarPage />} />
    </Routes>
  );
};

export default AppRoutes;
