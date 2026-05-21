import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageProducts from "../pages/admin/ManageProducts";
import ManageCategories from "../pages/admin/ManageCategories";
import ManageOrders from "../pages/admin/ManageOrders";
import ManageCustomers from "../pages/admin/ManageCustomers";
import ManageDeliveryBoys from "../pages/admin/ManageDeliveryBoys";
import Coupons from "../pages/admin/Coupons";
import Reports from "../pages/admin/Reports";
import AdminSettings from "../pages/admin/AdminSettings";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/products" element={<ManageProducts />} />
        <Route path="/categories" element={<ManageCategories />} />
        <Route path="/orders" element={<ManageOrders />} />
        <Route path="/customers" element={<ManageCustomers />} />
        <Route path="/delivery-boys" element={<ManageDeliveryBoys />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
