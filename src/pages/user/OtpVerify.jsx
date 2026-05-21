import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import {
  completeUserLogin,
  registerAccount,
  requestUserLoginOtp,
  verifyLoginOtp,
  requestRegistrationOtp,
  verifyRegistrationOtp,
} from "../../services/authService";

export default function OtpVerify() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, session } = useAuth();
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState(location.state?.otpHint || "");
  const [error, setError] = useState("");
  const [maskedDestination, setMaskedDestination] = useState(location.state?.maskedDestination || "");
  const purpose = location.state?.purpose || "REGISTER";
  const pendingRegistration = useMemo(() => {
    try {
      const rawValue = window.sessionStorage.getItem("ak-pending-register");
      return rawValue ? JSON.parse(rawValue) : null;
    } catch {
      return null;
    }
  }, []);
  const pendingLogin = useMemo(() => {
    try {
      const rawValue = window.sessionStorage.getItem("ak-pending-login");
      return rawValue ? JSON.parse(rawValue) : null;
    } catch {
      return null;
    }
  }, []);

  const isLoginFlow = purpose === "LOGIN";
  const pendingFlow = isLoginFlow ? pendingLogin : pendingRegistration;
  const identifier = location.state?.identifier || pendingFlow?.form?.email || "";
  const redirectTo = pendingFlow?.redirectTo || "/";

  if (session?.role === "user") {
    return <Navigate to={redirectTo} replace />;
  }

  if (!pendingFlow?.form || !identifier) {
    return <Navigate to={isLoginFlow ? "/login" : "/register"} replace />;
  }

  const handleVerify = async () => {
    try {
      setError("");
      if (isLoginFlow) {
        const verification = await verifyLoginOtp(identifier, otp);
        const payload = await completeUserLogin({
          ...pendingLogin.form,
          verificationToken: verification.verificationToken,
        });
        login("user", payload);
        window.sessionStorage.removeItem("ak-pending-login");
      } else {
        const verification = await verifyRegistrationOtp(identifier, otp);
        const payload = await registerAccount({
          ...pendingRegistration.form,
          verificationToken: verification.verificationToken,
        });
        login("user", payload);
        window.sessionStorage.removeItem("ak-pending-register");
      }
      navigate(redirectTo, { replace: true });
    } catch (verifyError) {
      setError(verifyError.message || "OTP verification failed.");
    }
  };

  const handleResend = async () => {
    try {
      setError("");
      const response = isLoginFlow
        ? await requestUserLoginOtp(pendingLogin.form)
        : await requestRegistrationOtp(identifier);
      setMaskedDestination(response.maskedDestination || "");
      setMessage(response.hint || "A new OTP has been sent.");
    } catch (resendError) {
      setError(resendError.message || "OTP could not be sent again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f0e3] px-4 py-10">
      <div className="soft-panel w-full max-w-lg p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
          {isLoginFlow ? "Login Verification" : "Verify Email"}
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">OTP Verification</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Enter the OTP sent to{" "}
          <span className="font-black text-slate-900">
            {maskedDestination || identifier}
          </span>.
        </p>

        <div className="mt-6 space-y-4">
          <input
            className="store-input w-full"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
          />
          <Button variant="accent" className="w-full py-4 font-black" onClick={handleVerify}>
            {isLoginFlow ? "Verify and Login" : "Verify and Create Account"}
          </Button>
          <button
            type="button"
            onClick={handleResend}
            className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800"
          >
            Resend OTP
          </button>
        </div>

        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <p className="mt-5 text-sm text-slate-500">
          Need to edit details?{" "}
          <Link to={isLoginFlow ? "/login" : "/register"} className="font-bold text-slate-900">
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
}
