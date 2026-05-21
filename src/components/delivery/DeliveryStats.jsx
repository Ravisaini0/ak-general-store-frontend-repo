export default function DeliveryStats({ label, value, hint = "" }) {
  return (
    <div className="rounded-[1.35rem] border border-slate-200 bg-[linear-gradient(180deg,_#0f1720,_#1e293b)] px-4 py-4 text-white shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-300">{hint}</p> : null}
    </div>
  );
}
