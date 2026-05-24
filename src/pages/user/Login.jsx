import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import PasswordField from "../../components/common/PasswordField";
import { useAuth } from "../../context/AuthContext";
import { requestUserLoginOtp } from "../../services/authService";
import { AUTH_REDIRECT_MESSAGE_KEY } from "../../utils/api";
import { isValidEmail } from "../../utils/validateForm";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = location.state?.from?.pathname || "/";
  const loginMessage = location.state?.loginMessage || "";

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

  if (session?.role === "user") {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!consentAccepted) {
      setError("Please accept the Privacy Policy and Terms & Conditions to continue.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      const otpPayload = await requestUserLoginOtp(form);

      window.sessionStorage.setItem(
        "ak-pending-login",
        JSON.stringify({
          form,
          redirectTo,
        })
      );

      navigate("/otp-verify", {
        state: {
          identifier: form.email,
          purpose: "LOGIN",
          otpHint: otpPayload.hint,
          maskedDestination: otpPayload.maskedDestination,
        },
      });
    } catch (loginError) {
      setError(loginError.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f0e3] px-4 py-10">
      <form onSubmit={handleSubmit} className="soft-panel w-full max-w-md p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">User Login</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Welcome back</h1>
        {loginMessage ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loginMessage}
          </div>
        ) : null}
        <div className="mt-6 space-y-4">
          <input
            className="store-input w-full"
            placeholder="name@email.com"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <PasswordField
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(event) => setConsentAccepted(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 accent-yellow-400"
            />
            <span>
              I accept the{" "}
              <Link to="/privacy-policy" className="font-bold text-slate-900">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms-and-conditions" className="font-bold text-slate-900">
                Terms & Conditions
              </Link>
              .
            </span>
          </label>
        </div>
        {isSubmitting ? (
          <p className="mt-4 text-sm font-semibold text-amber-700">Sending OTP to your email...</p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <Button
          variant="accent"
          className="mt-6 w-full py-4 font-black"
          type="submit"
          loading={isSubmitting}
        >
          {isSubmitting ? "Sending OTP..." : "Continue with OTP"}
        </Button>
        <p className="mt-4 text-sm text-slate-500">
          New user? <Link to="/register" className="font-bold text-slate-900">Create account</Link>
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Forgot your password? <Link to="/forgot-password" className="font-bold text-slate-900">Reset it here</Link>
        </p>
      </form>
    </div>
  );
}
