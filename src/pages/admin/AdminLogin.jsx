import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import PasswordField from "../../components/common/PasswordField";
import PasswordResetFlow from "../../components/common/PasswordResetFlow";
import { useAuth } from "../../context/AuthContext";
import { loginAdmin } from "../../services/authService";
import { AUTH_REDIRECT_MESSAGE_KEY } from "../../utils/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const message = window.sessionStorage.getItem(AUTH_REDIRECT_MESSAGE_KEY);
    if (message) {
      setError(message);
      window.sessionStorage.removeItem(AUTH_REDIRECT_MESSAGE_KEY);
    }
  }, []);

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      const payload = await loginAdmin({ email, password });
      login("admin", payload);
      navigate("/admin/dashboard");
    } catch (loginError) {
      setError(loginError.message || "Admin login failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f3f8] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft lg:grid-cols-[0.78fr_1.22fr]">
        <div className="flex flex-col justify-between bg-[#151d27] p-8 text-white">
          <div>
            <p className="text-6xl font-black text-yellow-400">ak</p>
            <p className="mt-4 text-xl font-black">Admin Panel</p>
            <p className="mt-2 text-sm text-slate-300">AK General Store Control Desk</p>
          </div>
          <p className="text-xs text-slate-400">Manage products, orders, categories, and reports.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
            Welcome Back
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Login to your account</h1>
          <div className="mt-8 space-y-4">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="store-input w-full"
              placeholder="owner@akstore.com"
            />
            <PasswordField
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </div>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="mt-4 text-sm font-bold text-orange-500"
          >
            Forgot Password?
          </button>
          <Button variant="accent" className="mt-6 w-full py-4 text-base font-black" type="submit">
            Login
          </Button>
        </form>
      </div>
      <Modal open={showForgotPassword} title="Admin Password Help" onClose={() => setShowForgotPassword(false)}>
        <PasswordResetFlow
          identifier={email}
          setIdentifier={setEmail}
          compact
          heading="Admin password recovery"
          description="Request a secure reset code on the registered admin email, verify it, and set a new password."
          identifierLabel="Admin email"
          identifierPlaceholder="owner@akstore.com"
        />
      </Modal>
    </div>
  );
}
