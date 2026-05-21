import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const DeliveryLogin = lazy(() => import("../pages/delivery/DeliveryLogin"));
const DeliveryDashboard = lazy(() => import("../pages/delivery/DeliveryDashboard"));
const AssignedOrders = lazy(() => import("../pages/delivery/AssignedOrders"));
const DeliveryOrderDetails = lazy(() => import("../pages/delivery/DeliveryOrderDetails"));
const DeliveryTracking = lazy(() => import("../pages/delivery/DeliveryTracking"));
const DeliveryEarnings = lazy(() => import("../pages/delivery/DeliveryEarnings"));
const DeliveryProfile = lazy(() => import("../pages/delivery/DeliveryProfile"));

export default function DeliveryRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<DeliveryLogin />} />
      <Route element={<ProtectedRoute role="delivery" />}>
        <Route path="/dashboard" element={<DeliveryDashboard />} />
        <Route path="/assigned-orders" element={<AssignedOrders />} />
        <Route path="/order/:id" element={<DeliveryOrderDetails />} />
        <Route path="/tracking/:id" element={<DeliveryTracking />} />
        <Route path="/earnings" element={<DeliveryEarnings />} />
        <Route path="/profile" element={<DeliveryProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/delivery/login" replace />} />
    </Routes>
  );
}
