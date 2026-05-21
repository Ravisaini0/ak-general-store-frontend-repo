import { RefreshCw } from "lucide-react";
import Button from "../common/Button";
import DeliverySidebar from "./DeliverySidebar";

export default function DeliveryLayout({
  title,
  description,
  actions = null,
  children,
  onRefresh,
  refreshing = false,
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.16),_transparent_28%),linear-gradient(180deg,_#f8fafc,_#eef2f7)] px-4 py-8 md:px-6">
      <div className="mx-auto grid max-w-[1480px] gap-6 lg:grid-cols-[270px_1fr]">
        <DeliverySidebar />
        <main className="rounded-[1.75rem] border border-white/70 bg-white/95 p-5 shadow-soft backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{title}</h1>
              {description ? (
                <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {onRefresh ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2"
                  onClick={onRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              ) : null}
              {actions}
            </div>
          </div>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
