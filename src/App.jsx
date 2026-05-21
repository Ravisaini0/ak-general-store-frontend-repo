import { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/common/Loader";

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <AppRoutes />
    </Suspense>
  );
}
