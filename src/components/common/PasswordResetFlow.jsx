import { useMemo, useState } from "react";
import Button from "./Button";
import PasswordField from "./PasswordField";
import {
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetOtp,
} from "../../services/accountService";

export default function PasswordResetFlow({
  identifier,
  setIdentifier,
  heading = "Reset your password",
  description = "Request a reset code, verify it, and set a new password.",
  identifierLabel = "Email or Phone",
  identifierPlaceholder = "Enter your email or phone",
  compact = false,
}) {
  const [otpCode, setOtpCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [maskedDestination, setMaskedDestination] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);

  const currentStep = useMemo(() => {
    if (verificationToken) {
      return 3;
    }

    if (maskedDestination) {
      return 2;
    }

    return 1;
  }, [verificationToken, maskedDestination]);

  const requestReset = async () => {
    if (requesting) {
      return;
    }

    try {
      setRequesting(true);
      setError("");
      setFeedback("");
      setVerificationToken("");
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
      const response = await requestPasswordReset(identifier);
      setMaskedDestination(response.maskedDestination || "");
      setFeedback(response.message || "If the account exists, a reset code has been sent.");
    } catch (requestError) {
      setError(requestError.message || "Reset request could not be processed.");
    } finally {
      setRequesting(false);
    }
  };

  const verifyResetCode = async () => {
    if (verifying) {
      return;
    }

    try {
      setVerifying(true);
      setError("");
      const response = await verifyPasswordResetOtp(identifier, otpCode);
      setVerificationToken(response.verificationToken || "");
      setFeedback(response.message || "Reset code verified. Set a new password.");
    } catch (verifyError) {
      setError(verifyError.message || "Reset code could not be verified.");
    } finally {
      setVerifying(false);
    }
  };

  const submitNewPassword = async () => {
    if (resetting) {
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setResetting(true);
      setError("");
      const response = await resetPassword({
        identifier,
        verificationToken,
        newPassword,
      });
      setFeedback(response.message || "Password reset successful.");
      setOtpCode("");
      setVerificationToken("");
      setNewPassword("");
      setConfirmPassword("");
      setMaskedDestination("");
    } catch (resetError) {
      setError(resetError.message || "Password could not be reset.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className={`${compact ? "text-base" : "text-xl"} font-black text-slate-950`}>{heading}</p>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-bold text-slate-900">{identifierLabel}</label>
        <input
          className="store-input w-full"
          placeholder={identifierPlaceholder}
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />
        <Button
          variant="primary"
          className="w-full py-3 font-black"
          type="button"
          onClick={requestReset}
          loading={requesting}
        >
          {requesting ? "Sending Code..." : "Send Reset Code"}
        </Button>
      </div>

      {currentStep >= 2 ? (
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-900">Step 2: Verify reset code</p>
          <p className="text-sm text-slate-600">
            Enter the code sent to {maskedDestination || "your account"}.
          </p>
          <input
            className="store-input w-full"
            placeholder="Enter 6-digit code"
            value={otpCode}
            onChange={(event) => setOtpCode(event.target.value)}
          />
          <Button
            variant="accent"
            className="w-full py-3 font-black"
            type="button"
            onClick={verifyResetCode}
            loading={verifying}
          >
            {verifying ? "Verifying..." : "Verify Reset Code"}
          </Button>
        </div>
      ) : null}

      {currentStep >= 3 ? (
        <div className="grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-bold text-slate-900">Step 3: Set a new password</p>
          <PasswordField
            placeholder="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
          />
          <PasswordField
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />
          <Button
            variant="accent"
            className="w-full py-3 font-black"
            type="button"
            onClick={submitNewPassword}
            loading={resetting}
          >
            {resetting ? "Updating..." : "Update Password"}
          </Button>
        </div>
      ) : null}

      {feedback ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
