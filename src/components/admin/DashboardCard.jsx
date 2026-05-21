export default function DashboardCard({ label, value, accent }) {
  return (
    <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-3 break-words text-2xl font-black text-slate-950 sm:text-3xl">{value}</p>
      <div className="mt-4 flex items-center gap-2">
        <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${accent}`} />
        <span className="text-xs font-bold text-green-600">+8%</span>
      </div>
    </div>
  );
}
