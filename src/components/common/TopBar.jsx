import { BadgePercent, CircleHelp, Clock3, Phone } from "lucide-react";

export default function TopBar() {
  const items = [
    { icon: BadgePercent, label: "Welcome to A K General Store" },
    { icon: Clock3, label: "Support available 24/7" },
    { icon: BadgePercent, label: "Free Delivery above Rs299" },
    { icon: Phone, label: "Need Help? 9483989109" },
    { icon: CircleHelp, label: "Fresh Flour Service Available" },
  ];

  return (
    <div className="border-b border-yellow-300 bg-yellow-400">
      <div className="store-shell flex gap-4 overflow-x-auto py-2 text-[11px] font-semibold text-slate-950 md:justify-between md:text-xs">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
