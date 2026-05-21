import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import PasswordField from "../../components/common/PasswordField";
import { useAuth } from "../../context/AuthContext";
import { requestRegistrationOtp } from "../../services/authService";
import { isValidEmail, isValidPhone, validateRequiredFields } from "../../utils/validateForm";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState("");
  const redirectTo = location.state?.from?.pathname || "/";

  if (session?.role === "user") {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fieldErrors = validateRequiredFields(form, ["name", "email", "phone", "password"]);
    if (Object.keys(fieldErrors).length) {
      setError("Please complete all required fields.");
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isValidPhone(form.phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!consentAccepted) {
      setError("Please accept the Privacy Policy and Terms & Conditions to continue.");
      return;
    }

    try {
      const otpPayload = await requestRegistrationOtp(form.email);

      window.sessionStorage.setItem(
        "ak-pending-register",
        JSON.stringify({
          form,
          redirectTo,
        })
      );

      navigate("/otp-verify", {
        state: {
          identifier: form.email,
          purpose: "REGISTER",
          otpHint: otpPayload.hint,
          maskedDestination: otpPayload.maskedDestination,
        },
      });
    } catch (requestError) {
      setError(requestError.message || "OTP could not be generated.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f0e3] px-4 py-10">
      <form onSubmit={handleSubmit} className="soft-panel w-full max-w-lg p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Create Account</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Join AK Store</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input className="store-input" placeholder="Full Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <input className="store-input" placeholder="Phone Number" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          <input className="store-input md:col-span-2" placeholder="Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          <PasswordField className="md:col-span-2" placeholder="Password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} autoComplete="new-password" />
        </div>
        <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
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
            </Link>
            ,{" "}
            <Link to="/terms-and-conditions" className="font-bold text-slate-900">
              Terms & Conditions
            </Link>
            , and{" "}
            <Link to="/return-refund-policy" className="font-bold text-slate-900">
              Return / Refund Policy
            </Link>
            .
          </span>
        </label>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <Button variant="accent" className="mt-6 w-full py-4 font-black" type="submit">
          Register
        </Button>
        <p className="mt-4 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-bold text-slate-900">Login</Link>
        </p>
      </form>
    </div>
  );
}
