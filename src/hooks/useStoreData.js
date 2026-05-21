import { useEffect, useMemo, useState } from "react";
import { fetchCategories, fetchProducts } from "../services/productService";

export function useStoreData(options = {}) {
  const search = options.search || "";
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStoreData() {
      setLoading(true);
      setError("");

      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetchCategories(),
          fetchProducts({ search }),
        ]);

        if (cancelled) {
          return;
        }

        setCategories(categoriesResponse);
        setProducts(productsResponse);
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        setCategories([]);
        setProducts([]);
        setError(fetchError.message || "Store data could not be loaded from the backend.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStoreData();

    return () => {
      cancelled = true;
    };
  }, [search]);

  return useMemo(
    () => ({
      categories,
      products,
      loading,
      error,
      backendReady: !loading && !error,
    }),
    [categories, products, loading, error]
  );
}
