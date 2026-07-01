import { Award, Leaf, ShoppingCart, Timer, Truck } from "lucide-react";

const highlights = [
  { label: "10-30 min\nDelivery", icon: Timer },
  { label: "Best Quality\nProducts", icon: Award },
  { label: "Free Delivery\nabove Rs299", icon: Truck },
  { label: "Fresh & Pure\nEverytime", icon: Leaf },
];

export default function Loader({ progress = {} }) {
  const total = Number(progress.total || 4);
  const completed = Number(progress.completed || 0);
  const percent = Math.max(8, Math.min(100, Math.round((completed / total) * 100)));
  const loadingText = progress.retrying ? "Waking live server..." : "Loading...";
  const statusText = progress.retrying
    ? `Attempt ${progress.attempt || 1} - reconnecting`
    : progress.currentLabel
      ? `Preparing ${progress.currentLabel}`
      : "Preparing live catalog";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030303] px-4 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,196,0,0.1),transparent_34%),radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.06),transparent_24%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.76))]" />

      <div className="relative flex w-full max-w-4xl flex-col items-center text-center">
        <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
          <div className="absolute inset-8 rounded-full border border-yellow-400/80 shadow-[0_0_50px_rgba(250,204,21,0.24)]" />
          <div className="absolute right-10 top-16 h-5 w-5 rounded-full bg-yellow-300 shadow-[0_0_34px_14px_rgba(250,204,21,0.8)]" />
          <div className="absolute bottom-16 left-10 h-4 w-4 rounded-full bg-yellow-300 shadow-[0_0_30px_12px_rgba(250,204,21,0.75)]" />
          <div className="absolute left-10 top-12 h-32 w-32 rounded-full border-l border-yellow-400/40" />

          <div className="relative -mt-2 flex items-end justify-center text-[7.5rem] font-black leading-none tracking-[-0.14em] sm:text-[10rem]">
            <span className="bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text pr-1 text-transparent">
              a
            </span>
            <span className="bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-700 bg-clip-text text-transparent drop-shadow-[0_12px_34px_rgba(250,204,21,0.22)]">
              k
            </span>
          </div>
        </div>

        <div className="-mt-5">
          <h1 className="text-3xl font-black tracking-[0.22em] text-white sm:text-4xl">
            A K <span className="text-yellow-400">GENERAL STORE</span>
          </h1>
          <div className="mt-4 flex items-center justify-center gap-4 text-lg font-semibold text-white/90 sm:text-2xl">
            <span className="h-px w-12 bg-yellow-400" />
            <span>Your Daily Needs Partner</span>
            <span className="h-px w-12 bg-yellow-400" />
          </div>
        </div>

        <div className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center justify-center gap-3 sm:border-r sm:border-yellow-400/35 ${
                  index === highlights.length - 1 ? "sm:border-r-0" : ""
                }`}
              >
                <Icon className="h-8 w-8 shrink-0 text-yellow-400 sm:h-10 sm:w-10" />
                <p className="whitespace-pre-line text-left text-sm font-semibold leading-6 text-white sm:text-base">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="relative mt-14 w-full max-w-3xl text-yellow-500/70">
          <div className="mx-auto hidden h-56 max-w-xl sm:block">
            <svg viewBox="0 0 720 260" className="h-full w-full overflow-visible">
              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path d="M92 238h536" />
                <path d="M190 82h340v156H190z" />
                <path d="M172 112h376l-34 48H206z" />
                <path d="M206 160c12 18 32 18 44 0c12 18 32 18 44 0c12 18 32 18 44 0c12 18 32 18 44 0c12 18 32 18 44 0c12 18 32 18 44 0c12 18 32 18 44 0" />
                <path d="M230 196h70v42h-70zM420 196h70v42h-70z" />
                <path d="M324 184h72v54h-72zM344 184v54" />
                <path d="M230 98h260v26H230z" />
                <path d="M286 116h148" />
                <path d="M124 236l-22-76h70l-18 76" />
                <path d="M108 176h58m-48 18h42m-36 18h30" />
                <circle cx="116" cy="244" r="8" />
                <circle cx="154" cy="244" r="8" />
                <path d="M600 198h54v34h-54zM654 232h20m-66 8a10 10 0 1 0 20 0m30 0a10 10 0 1 0 20 0" />
                <path d="M588 232h-18m34-34c10-18 28-20 44-8" />
                <path d="M252 226c18-20 54-20 72 0m86 0c18-20 54-20 72 0" />
                <path d="M252 212h70m88 0h70" />
              </g>
            </svg>
          </div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/30 bg-black/40 sm:hidden">
            <ShoppingCart className="h-8 w-8 text-yellow-400" />
          </div>
          <div className="mx-auto h-px w-full bg-yellow-500/30" />
        </div>

        <div className="mt-10 w-full max-w-xl">
          <p className="text-2xl font-semibold text-white">{loadingText}</p>
          <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/15 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 shadow-[0_0_22px_rgba(250,204,21,0.45)] transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-6 text-3xl font-semibold text-yellow-400">{percent}%</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.28em] text-white/45">{statusText}</p>
        </div>
      </div>
    </div>
  );
}
