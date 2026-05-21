import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const AdminLogin = lazy(() => import("../pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const ManageProducts = lazy(() => import("../pages/admin/ManageProducts"));
const ManageCategories = lazy(() => import("../pages/admin/ManageCategories"));
const ManageOrders = lazy(() => import("../pages/admin/ManageOrders"));
const ManageChakkiBookings = lazy(() => import("../pages/admin/ManageChakkiBookings"));
const ManageCustomers = lazy(() => import("../pages/admin/ManageCustomers"));
const ManageDeliveryBoys = lazy(() => import("../pages/admin/ManageDeliveryBoys"));
const Coupons = lazy(() => import("../pages/admin/Coupons"));
const Reports = lazy(() => import("../pages/admin/Reports"));
const AdminSettings = lazy(() => import("../pages/admin/AdminSettings"));

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/products" element={<ManageProducts />} />
        <Route path="/categories" element={<ManageCategories />} />
        <Route path="/orders" element={<ManageOrders />} />
        <Route path="/chakki-bookings" element={<ManageChakkiBookings />} />
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
