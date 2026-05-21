import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";

export default function BottomCartBar() {
  const { totalItems, totalAmount } = useCart();

  if (!totalItems) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 rounded-3xl bg-slate-950 px-4 py-4 text-white shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-300">{totalItems} items in cart</p>
          <p className="text-lg font-black">{formatPrice(totalAmount)}</p>
        </div>
        <Link
          to="/cart"
          className="rounded-full bg-yellow-400 px-5 py-3 text-sm font-bold text-slate-950"
        >
          View Cart
        </Link>
      </div>
    </div>
  );
}
