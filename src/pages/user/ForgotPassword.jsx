import { useState } from "react";
import { Link } from "react-router-dom";
import PasswordResetFlow from "../../components/common/PasswordResetFlow";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f0e3] px-4 py-10">
      <div className="soft-panel w-full max-w-lg p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Account Recovery</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Forgot Password</h1>
        <div className="mt-6">
          <PasswordResetFlow
            identifier={identifier}
            setIdentifier={setIdentifier}
            heading="Customer password recovery"
            description="Request a secure reset code. We will send it to your registered account email before allowing a password change."
            identifierLabel="Email or phone"
            identifierPlaceholder="Enter your registered email or phone"
          />
        </div>

        <p className="mt-5 text-sm text-slate-500">
          Back to <Link to="/login" className="font-bold text-slate-900">Login</Link>
        </p>
      </div>
    </div>
  );
}
