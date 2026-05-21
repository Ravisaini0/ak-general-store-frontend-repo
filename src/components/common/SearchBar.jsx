import { ArrowRight, Search } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { fetchProducts } from "../../services/productService";
import { sortProductsBySearchRelevance } from "../../utils/search";

export default function SearchBar({ placeholder = "Search products...", className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const deferredQuery = useDeferredValue(query);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const blurTimeoutRef = useRef(null);

  useEffect(() => {
    setQuery(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const trimmed = deferredQuery.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return undefined;
    }

    let cancelled = false;
    setLoadingSuggestions(true);

    const timer = setTimeout(async () => {
      try {
        const products = await fetchProducts({ search: trimmed });
        if (!cancelled) {
          setSuggestions(sortProductsBySearchRelevance(products, [], trimmed).slice(0, 6));
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingSuggestions(false);
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [deferredQuery]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    const nextPath = trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : "/products";

    if (location.pathname === "/products" && !trimmed && !searchParams.get("search")) {
      return;
    }

    navigate(nextPath);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative min-w-0 w-full flex-1 ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="flex min-w-0 w-full flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
      >
        <Search className="h-4 w-4 text-slate-400" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          placeholder={placeholder}
          value={query}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            blurTimeoutRef.current = setTimeout(() => setShowSuggestions(false), 120);
          }}
          onChange={(event) => {
            const nextValue = event.target.value;
            setQuery(nextValue);
            setShowSuggestions(nextValue.trim().length >= 2);
          }}
        />
        <button type="submit" className="shrink-0 rounded-xl bg-yellow-400 px-3 py-2 text-xs font-bold text-slate-950 sm:px-5 sm:text-sm">
          Search
        </button>
      </form>

      {showSuggestions && query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Search Suggestions
          </div>
          {loadingSuggestions ? (
            <div className="px-4 py-4 text-sm text-slate-500">Searching products...</div>
          ) : suggestions.length ? (
            <>
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    navigate(`/product/${product.id}`);
                    setShowSuggestions(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{product.name}</p>
                    <p className="truncate text-xs text-slate-500">{product.unit}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              ))}
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  navigate(`/products?search=${encodeURIComponent(query.trim())}`);
                  setShowSuggestions(false);
                }}
                className="flex w-full items-center justify-between gap-3 bg-yellow-50 px-4 py-3 text-left text-sm font-bold text-slate-900 transition hover:bg-yellow-100"
              >
                <span>View all results for "{query.trim()}"</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            </>
          ) : (
            <div className="px-4 py-4 text-sm text-slate-500">
              No direct matches found. Try product names like atta, dal, rice, oil, or biscuits.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
