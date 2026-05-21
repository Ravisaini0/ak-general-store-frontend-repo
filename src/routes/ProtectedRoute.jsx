import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    if (role === "admin") {
      return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    if (role === "delivery") {
      return <Navigate to="/delivery/login" replace state={{ from: location }} />;
    }

    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && session.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
