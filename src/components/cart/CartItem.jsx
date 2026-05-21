import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";
import { getFallbackProductImage } from "../../utils/storeMappers";

export default function CartItem({ item, onDecrease, onIncrease, onRemove }) {
  return (
    <div className="card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <img
        src={item.product.imageUrl || getFallbackProductImage(item.product)}
        alt={item.product.name}
        className="h-20 w-20 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 object-cover"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = getFallbackProductImage(item.product);
        }}
      />
      <div className="w-full flex-1">
        <h3 className="font-bold text-slate-900">{item.product.name}</h3>
        <p className="text-sm text-slate-500">{item.product.unit}</p>
        <p className="mt-2 font-semibold text-slate-950">{formatPrice(item.product.price)}</p>
      </div>
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1">
          <button onClick={onDecrease} className="rounded-full p-1 hover:bg-slate-100">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-semibold">{item.quantity}</span>
          <button onClick={onIncrease} className="rounded-full p-1 hover:bg-slate-100">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button onClick={onRemove} className="rounded-full p-2 text-red-500 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
