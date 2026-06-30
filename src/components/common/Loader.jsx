export default function Loader({ progress = {} }) {
  const total = Number(progress.total || 4);
  const completed = Number(progress.completed || 0);
  const percent = Math.max(8, Math.min(100, Math.round((completed / total) * 100)));
  const checks = [
    { key: "health", label: "Backend API" },
    { key: "settings", label: "Store settings" },
    { key: "categories", label: "Categories" },
    { key: "products", label: "Products" },
  ];
  const statusText = progress.retrying
    ? progress.message || "Live server is waking up. Retrying..."
    : `Preparing ${progress.currentLabel || "live catalog"}...`;

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[#070807] px-4 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(250,204,21,0.18),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(249,115,22,0.16),transparent_26%)]" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-yellow-500/20 bg-[linear-gradient(180deg,_rgba(17,17,17,0.96),_rgba(8,8,8,0.98))] p-6 shadow-2xl sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-2xl font-black text-slate-950 shadow-[0_18px_50px_rgba(250,204,21,0.25)]">
            AK
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-200">AK General Store</p>
            <h1 className="mt-1 text-2xl font-black text-white">Getting your store ready</h1>
            <p className="mt-1 text-sm text-slate-400">Live products, prices, and service area are loading.</p>
          </div>
        </div>

        <div className="mt-7 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-4 text-sm text-yellow-100">
            <span className="font-bold">{statusText}</span>
            <span className="font-black text-yellow-300">{percent}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-yellow-400 transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          {checks.map((check, index) => {
            const isDone = completed > index;
            const isCurrent = completed === index && !progress.retrying;

            return (
              <div
                key={check.key}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                  isDone
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                    : isCurrent
                      ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-100"
                      : "border-white/10 bg-white/[0.03] text-slate-400"
                }`}
              >
                <span>{check.label}</span>
                <span className="text-xs font-black uppercase tracking-widest">
                  {isDone ? "Ready" : isCurrent ? "Checking" : "Queued"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-slate-300">
          <div className="rounded-2xl border border-yellow-500/10 bg-white/5 px-2 py-3">Fast delivery</div>
          <div className="rounded-2xl border border-yellow-500/10 bg-white/5 px-2 py-3">Fresh stock</div>
          <div className="rounded-2xl border border-yellow-500/10 bg-white/5 px-2 py-3">Secure checkout</div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400" />
          </span>
          <span>
            {progress.retrying
              ? `Attempt ${progress.attempt || 1}: waiting for live API response`
              : "Please wait, the catalog opens automatically."}
          </span>
        </div>
      </div>
    </div>
  );
}
