import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/common/Loader";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return <AppRoutes />;
}
