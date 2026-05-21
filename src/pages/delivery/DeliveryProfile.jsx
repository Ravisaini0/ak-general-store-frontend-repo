import Button from "../../components/common/Button";
import DeliveryLayout from "../../components/delivery/DeliveryLayout";
import { useAuth } from "../../context/AuthContext";

export default function DeliveryProfile() {
  const { session, logout } = useAuth();

  return (
    <DeliveryLayout
      title="Delivery Profile"
      description="Secure identity and contact details for route coordination."
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Name</p>
              <p className="mt-2 text-lg font-black text-slate-950">{session?.name || "Delivery Partner"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-2 text-lg font-black text-slate-950">{session?.email || "delivery@akstore.com"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Phone</p>
              <p className="mt-2 text-lg font-black text-slate-950">{session?.phone || "9876543210"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Role</p>
              <p className="mt-2 text-lg font-black text-slate-950">Delivery Partner</p>
            </div>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-xl font-black text-slate-950">Account actions</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use this profile for assigned orders only. Contact admin if your delivery phone or email changes.
          </p>
          <Button variant="accent" className="mt-5 w-full py-4 font-black" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </DeliveryLayout>
  );
}
