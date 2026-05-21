export default function Modal({ open, title, children, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 px-4 py-6">
      <div className="mx-auto flex min-h-full max-w-lg items-center justify-center">
        <div className="max-h-[90vh] w-full overflow-hidden rounded-[1.5rem] bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 className="pr-4 text-lg font-black text-slate-950 sm:text-xl">{title}</h2>
            <button
              className="shrink-0 rounded-xl border border-slate-200 px-3 py-1 text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <div className="max-h-[calc(90vh-73px)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
