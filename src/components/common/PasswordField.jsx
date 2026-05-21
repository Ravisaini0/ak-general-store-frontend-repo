import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

export default function PasswordField({
  value,
  onChange,
  placeholder = "Password",
  className = "",
  autoComplete = "current-password",
  name,
}) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();

  return (
    <div className={`relative ${className}`}>
      <input
        id={inputId}
        name={name}
        type={visible ? "text" : "password"}
        className="store-input w-full pr-12"
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
