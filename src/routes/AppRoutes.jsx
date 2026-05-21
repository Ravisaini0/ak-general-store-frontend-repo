import { Route, Routes } from "react-router-dom";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";
import DeliveryRoutes from "./DeliveryRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/delivery/*" element={<DeliveryRoutes />} />
      <Route path="/*" element={<UserRoutes />} />
    </Routes>
  );
}
