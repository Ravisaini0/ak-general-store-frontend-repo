import Footer from "../../components/common/Footer";
import BackButton from "../../components/common/BackButton";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const { session, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({
        avatar: typeof reader.result === "string" ? reader.result : null,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/" className="mb-5" />
        <div className="soft-panel max-w-3xl p-6">
          <h1 className="text-4xl font-black text-slate-950">My Profile</h1>
          <div className="mt-6 flex flex-wrap items-center gap-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            {session?.avatar ? (
              <img src={session.avatar} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-950 text-3xl font-black text-yellow-400">
                {(session?.name || "A").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-lg font-black text-slate-950">{session?.name || "AK User"}</p>
              <p className="mt-1 text-sm text-slate-500">{session?.email || session?.phone || "Not available"}</p>
              <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-slate-950">
                Upload Profile Image
                <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
              </label>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Name</p>
              <p className="mt-2 text-xl font-black text-slate-950">{session?.name || "AK User"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-2 text-xl font-black text-slate-950">{session?.email || "Not available"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Role</p>
              <p className="mt-2 text-xl font-black text-slate-950">{session?.role || "user"}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/my-orders" className="inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800">
              My Orders
            </Link>
            <Link to="/address-book" className="inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800">
              Address Book
            </Link>
            <Link to="/aata-chakki-booking" className="inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800">
              Aata Chakki Booking
            </Link>
            <Link to="/wishlist" className="inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800">
              Wishlist
            </Link>
          </div>
          <Button variant="accent" className="mt-6 px-6 py-3 font-black" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
