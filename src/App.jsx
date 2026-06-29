import { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import BackendReadinessGate from "./components/common/BackendReadinessGate";
import Loader from "./components/common/Loader";

export default function App() {
  return (
    <BackendReadinessGate>
      <Suspense fallback={<Loader />}>
        <AppRoutes />
      </Suspense>
    </BackendReadinessGate>
  );
}
