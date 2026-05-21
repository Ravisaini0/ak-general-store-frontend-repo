export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5";

  const variants = {
    primary: "bg-slate-950 text-white hover:bg-slate-800",
    accent: "bg-yellow-400 text-slate-950 hover:bg-yellow-300",
    ghost: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
    secondary: "border border-slate-200 bg-slate-950 text-white hover:bg-slate-800",
    orange: "bg-orange-500 text-white hover:bg-orange-400",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
