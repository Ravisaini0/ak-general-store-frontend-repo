export default function Loader({ progress = {} }) {
  const total = Number(progress.total || 4);
  const completed = Number(progress.completed || 0);
  const percent = Math.max(8, Math.min(100, Math.round((completed / total) * 100)));
  const statusText = progress.retrying
    ? progress.message || "Backend is starting. Retrying..."
    : `Checking ${progress.currentLabel || "backend"}...`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
      <div className="w-full max-w-sm rounded-[2rem] border border-yellow-500/20 bg-[radial-gradient(circle_at_bottom,_rgba(250,204,21,0.18),_transparent_36%),linear-gradient(180deg,_#0b0b0b,_#111111)] p-8 shadow-2xl">
        <div className="mx-auto flex h-56 items-center justify-center rounded-[1.75rem] border border-yellow-400/20 bg-black/40 text-center">
          <div>
            <div className="text-8xl font-black leading-none tracking-tight text-yellow-400">ak</div>
            <p className="mt-3 text-xl font-black tracking-[0.3em] text-yellow-100">AK GENERAL STORE</p>
            <p className="mt-2 text-sm text-slate-300">Your Daily Needs Partner</p>
          </div>
        </div>
        <div className="mt-7 grid grid-cols-3 gap-3 text-center text-xs text-slate-300">
          <div className="rounded-2xl border border-yellow-500/10 bg-white/5 px-3 py-3">10-30 min delivery</div>
          <div className="rounded-2xl border border-yellow-500/10 bg-white/5 px-3 py-3">Best quality</div>
          <div className="rounded-2xl border border-yellow-500/10 bg-white/5 px-3 py-3">Wide products</div>
        </div>
        <div className="mt-8">
          <div className="flex items-center justify-between text-sm text-yellow-100">
            <span>{statusText}</span>
            <span>{percent}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-yellow-400 transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          {progress.retrying
            ? `Attempt ${progress.attempt || 1}: waiting for live API response`
            : "Preparing live products, categories, and store settings"}
        </p>
      </div>
    </div>
  );
}
