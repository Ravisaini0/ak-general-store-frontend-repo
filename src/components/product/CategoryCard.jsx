import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [category.id, category.imageUrl]);

  return (
    <Link
      to={`/category/${category.slug}`}
      className="flex w-full min-w-0 flex-col items-center rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className={`h-14 w-14 overflow-hidden rounded-2xl bg-gradient-to-br ${category.color}`}>
        {category.imageUrl && !imageFailed ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] font-bold uppercase tracking-wide text-slate-600">
            {imageFailed ? "Image unavailable" : category.name}
          </div>
        )}
      </div>
      <h3 className="mt-3 text-sm font-bold text-slate-900">{category.name}</h3>
      <p className="mt-1 text-[11px] text-slate-500">Explore</p>
    </Link>
  );
}
