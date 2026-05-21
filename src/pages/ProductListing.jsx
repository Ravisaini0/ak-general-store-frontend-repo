import { Filter, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import SeoHead from "../components/common/SeoHead";
import TopBar from "../components/common/TopBar";
import BottomCartBar from "../components/cart/BottomCartBar";
import ProductGrid from "../components/product/ProductGrid";
import { useStoreData } from "../hooks/useStoreData";
import { sortProductsBySearchRelevance } from "../utils/search";

export default function ProductListing() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const { categories, products, loading, error } = useStoreData({ search });
  const [filterMode, setFilterMode] = useState("all");
  const [sortMode, setSortMode] = useState("popular");
  const normalizedSlug = slug === "atta" ? "aata" : slug;
  const category =
    categories.find((item) => item.slug === normalizedSlug) ||
    categories.find((item) => item.name.toLowerCase() === normalizedSlug);

  const filteredProducts = useMemo(() => {
    const categoryFiltered = category
      ? products.filter((product) => product.categoryId === category.id)
      : products;

    const searchFiltered = search
      ? sortProductsBySearchRelevance(categoryFiltered, categories, search)
      : categoryFiltered;

    const filterApplied = searchFiltered.filter((product) => {
      if (filterMode === "featured") {
        return product.featured;
      }

      if (filterMode === "budget") {
        return Number(product.price) <= 500;
      }

      return true;
    });

    const sorted = [...filterApplied];

    if (sortMode === "popular" && search) {
      return sorted;
    }

    if (sortMode === "priceLowHigh") {
      sorted.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortMode === "priceHighLow") {
      sorted.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortMode === "nameAsc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === "nameDesc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }

    return sorted;
  }, [categories, category, filterMode, products, search, sortMode]);

  return (
    <div className="page-shell">
      <SeoHead
        title={
          search
            ? `Search "${search}" | AK General Store`
            : `${category?.name || "All Products"} | AK General Store`
        }
        description={
          search
            ? `Browse grocery search results for ${search} on AK General Store with fast local ordering and secure checkout.`
            : `Browse ${category?.name || "all grocery"} products on AK General Store including daily essentials, pantry staples, and trusted household items.`
        }
      />
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <section className="soft-panel p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
                {search
                  ? `Search Results for "${search}"`
                  : category?.name || "All Products"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading products..."
                  : `${filteredProducts.length} items available`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                <Filter className="h-4 w-4" />
                <select
                  className="bg-transparent outline-none"
                  value={filterMode}
                  onChange={(event) => setFilterMode(event.target.value)}
                >
                  <option value="all">All Items</option>
                  <option value="featured">Featured</option>
                  <option value="budget">Under Rs500</option>
                </select>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                <SlidersHorizontal className="h-4 w-4" />
                <select
                  className="bg-transparent outline-none"
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value)}
                >
                  <option value="popular">Popular</option>
                  <option value="priceLowHigh">Price: Low to High</option>
                  <option value="priceHighLow">Price: High to Low</option>
                  <option value="nameAsc">Name: A to Z</option>
                  <option value="nameDesc">Name: Z to A</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}
          {filteredProducts.length ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="soft-panel p-8 text-center">
              <p className="text-lg font-black text-slate-900">No products matched your search.</p>
              <p className="mt-2 text-sm text-slate-500">
                Try searching for atta, flour, rice, dal, oil, masala, or biscuits.
              </p>
              <Link
                to="/products"
                className="mt-5 inline-flex rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950"
              >
                Browse Full Catalog
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
      <BottomCartBar />
    </div>
  );
}
