import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import PasswordField from "../../components/common/PasswordField";
import PasswordResetFlow from "../../components/common/PasswordResetFlow";
import { useAuth } from "../../context/AuthContext";
import { loginDelivery } from "../../services/authService";
import { AUTH_REDIRECT_MESSAGE_KEY } from "../../utils/api";

export default function DeliveryLogin() {
  const navigate = useNavigate();
  const { login, isDelivery } = useAuth();
  const [phone, setPhone] = useState("");
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

  if (isDelivery) {
    return <Navigate to="/delivery/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      const payload = await loginDelivery({ phone, password });
      login("delivery", payload);
      navigate("/delivery/dashboard");
    } catch (loginError) {
      setError(loginError.message || "Delivery login failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6fa] px-4 py-10">
      <div className="device-frame w-full max-w-sm">
        <div className="rounded-[1.5rem] border border-yellow-200 bg-gradient-to-b from-yellow-400 to-yellow-300 p-5 text-center">
          <p className="text-6xl font-black text-white">ak</p>
          <p className="text-sm font-black text-slate-950">Delivery Partner</p>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <p className="text-sm font-black text-slate-950">Mobile Number</p>
          <input value={phone} onChange={(event) => setPhone(event.target.value)} className="store-input mt-2 w-full" placeholder="9876543210" />
          <p className="mt-4 text-sm font-black text-slate-950">Password</p>
          <PasswordField value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2" placeholder="Enter password" />
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-bold text-slate-900">Admin-managed access</p>
            <p>Your delivery account is created by the store admin.</p>
            <p className="mt-1">Use your assigned mobile number and password to sign in.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="mt-4 text-sm font-bold text-orange-500"
          >
            Forgot Password?
          </button>
          <Button variant="accent" className="mt-5 w-full py-4 font-black" type="submit">
            Login
          </Button>
        </form>
      </div>
      <Modal open={showForgotPassword} title="Delivery Password Help" onClose={() => setShowForgotPassword(false)}>
        <PasswordResetFlow
          identifier={phone}
          setIdentifier={setPhone}
          compact
          heading="Delivery password recovery"
          description="Request a secure reset code using the assigned mobile number. If the account exists, the code will be sent to its registered recovery email."
          identifierLabel="Delivery mobile number"
          identifierPlaceholder="9876543210"
        />
      </Modal>
    </div>
  );
}
