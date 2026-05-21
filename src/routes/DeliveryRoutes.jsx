import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DeliveryLogin from "../pages/delivery/DeliveryLogin";
import DeliveryDashboard from "../pages/delivery/DeliveryDashboard";
import AssignedOrders from "../pages/delivery/AssignedOrders";
import DeliveryOrderDetails from "../pages/delivery/DeliveryOrderDetails";
import DeliveryTracking from "../pages/delivery/DeliveryTracking";
import DeliveryEarnings from "../pages/delivery/DeliveryEarnings";
import DeliveryProfile from "../pages/delivery/DeliveryProfile";

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
