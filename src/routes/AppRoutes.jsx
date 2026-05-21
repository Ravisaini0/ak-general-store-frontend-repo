import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import ScrollToTop from "../components/common/ScrollToTop";
import RouteSeo from "../components/common/RouteSeo";

const UserRoutes = lazy(() => import("./UserRoutes"));
const AdminRoutes = lazy(() => import("./AdminRoutes"));
const DeliveryRoutes = lazy(() => import("./DeliveryRoutes"));

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <RouteSeo />
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/delivery/*" element={<DeliveryRoutes />} />
        <Route path="/*" element={<UserRoutes />} />
      </Routes>
    </>
  );
}
