import { CheckCircle2, Clock3, PackageCheck, Server, ShieldCheck, Truck } from "lucide-react";

const readinessChecks = [
  { key: "health", label: "Backend API", description: "Connecting to live server" },
  { key: "settings", label: "Store settings", description: "Loading delivery, payment, and support config" },
  { key: "categories", label: "Categories", description: "Preparing storefront navigation" },
  { key: "products", label: "Products", description: "Syncing latest catalog and prices" },
];

const serviceHighlights = [
  { label: "Fast delivery", icon: Truck },
  { label: "Fresh catalog", icon: PackageCheck },
  { label: "Secure checkout", icon: ShieldCheck },
];

export default function Loader({ progress = {} }) {
  const total = Number(progress.total || readinessChecks.length);
  const completed = Number(progress.completed || 0);
  const percent = Math.max(8, Math.min(100, Math.round((completed / total) * 100)));
  const statusText = progress.retrying
    ? progress.message || "Live server is waking up. Retrying..."
    : `Preparing ${progress.currentLabel || "live catalog"}...`;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070806] px-4 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(250,204,21,0.24),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(34,197,94,0.12),transparent_24%),radial-gradient(circle_at_70%_92%,rgba(249,115,22,0.2),transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />

      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2.25rem] border border-yellow-400/20 bg-[linear-gradient(135deg,_rgba(15,15,15,0.98),_rgba(8,8,8,0.98))] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-yellow-400/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-2xl font-black text-slate-950 shadow-[0_18px_60px_rgba(250,204,21,0.28)]">
                  AK
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.36em] text-yellow-200">AK General Store</p>
                  <h1 className="mt-1 text-2xl font-black leading-tight text-white sm:text-4xl">
                    Getting fresh groceries ready
                  </h1>
                </div>
              </div>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                We are checking the live backend, store settings, categories, and product catalog before opening the shop.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {serviceHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <Icon className="h-5 w-5 text-yellow-300" />
                      <p className="mt-3 text-sm font-black text-white">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-400/15 text-yellow-200">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">Opening automatically</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Please wait. No refresh needed while the live API becomes ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Startup Status</p>
                  <h2 className="mt-2 text-xl font-black text-white">{statusText}</h2>
                </div>
                <div className="rounded-2xl bg-yellow-400 px-3 py-2 text-sm font-black text-slate-950">
                  {percent}%
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-5 space-y-3">
                {readinessChecks.map((check, index) => {
                  const isDone = completed > index;
                  const isCurrent = completed === index && !progress.retrying;
                  const isRetrying = progress.retrying && index === 0;

                  return (
                    <div
                      key={check.key}
                      className={`rounded-2xl border px-4 py-3 transition ${
                        isDone
                          ? "border-emerald-400/25 bg-emerald-400/10"
                          : isCurrent || isRetrying
                            ? "border-yellow-400/30 bg-yellow-400/10"
                            : "border-white/10 bg-black/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                              isDone
                                ? "bg-emerald-400/15 text-emerald-200"
                                : isCurrent || isRetrying
                                  ? "bg-yellow-400/15 text-yellow-200"
                                  : "bg-white/5 text-slate-500"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Server className={`h-5 w-5 ${isCurrent || isRetrying ? "animate-pulse" : ""}`} />
                            )}
                          </span>
                          <div>
                            <p className="text-sm font-black text-white">{check.label}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{check.description}</p>
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {isDone ? "Ready" : isCurrent || isRetrying ? "Checking" : "Queued"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-xs leading-6 text-yellow-100">
                {progress.retrying
                  ? `Attempt ${progress.attempt || 1}: free servers may take a few seconds to wake up.`
                  : "Live prices and product availability will be shown once startup checks pass."}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="h-14 animate-pulse rounded-xl bg-white/10" />
                  <div className="mt-3 h-2 animate-pulse rounded-full bg-white/10" />
                  <div className="mt-2 h-2 w-2/3 animate-pulse rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
