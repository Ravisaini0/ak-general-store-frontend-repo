const backendAssetBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const categoryColorMap = {
  aata: "from-amber-100 to-yellow-200",
  dal: "from-orange-100 to-orange-200",
  rice: "from-lime-100 to-emerald-200",
  oil: "from-yellow-100 to-amber-300",
  masala: "from-rose-100 to-pink-200",
  snacks: "from-sky-100 to-cyan-200",
};

const categoryImageMap = {
  aata:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80",
  dal:
    "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=500&q=80",
  rice:
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80",
  oil:
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80",
  masala:
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80",
  snacks:
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80",
};

const productImageMap = {
  grain:
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=80",
  dal:
    "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80",
  rice:
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
  oil:
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80",
  spice:
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80",
  snack:
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
};

const categoryVisualMap = {
  1: "grain",
  2: "dal",
  3: "rice",
  4: "oil",
  5: "spice",
  6: "snack",
};

function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function inferVisual(product) {
  const seed = `${product.name} ${product.slug} ${product.categoryId} ${(product.categoryIds || []).join(" ")}`.toLowerCase();

  if (seed.includes("dal")) return "dal";
  if (seed.includes("rice")) return "rice";
  if (seed.includes("oil") || seed.includes("ghee")) return "oil";
  if (seed.includes("masala") || seed.includes("spice")) return "spice";
  if (seed.includes("snack") || seed.includes("biscuit")) return "snack";
  return "grain";
}

function normalizeAssetUrl(url = "") {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }

  if (url.startsWith("/images/")) {
    return "";
  }

  if (url.startsWith("/")) {
    return `${backendAssetBaseUrl}${url}`;
  }

  return url;
}

function normalizeAssetUrls(urls = []) {
  return urls
    .map((url) => normalizeAssetUrl(url))
    .filter((url, index, array) => url && array.indexOf(url) === index);
}

export function mapCategory(category) {
  const slug = category.slug || slugify(category.name);

  return {
    id: Number(category.id),
    name: category.name,
    slug,
    color: categoryColorMap[slug] || "from-yellow-100 to-orange-200",
    imageUrl: normalizeAssetUrl(category.imageUrl) || categoryImageMap[slug] || "",
    active: category.active ?? true,
  };
}

export function mapProduct(product) {
  const visual = inferVisual(product);
  const normalizedImageUrls = normalizeAssetUrls(product.imageUrls || []);
  const categoryIds = (product.categoryIds?.length ? product.categoryIds : [product.categoryId])
    .map(Number)
    .filter(Boolean);
  const primaryImage =
    normalizeAssetUrl(product.imageUrl) ||
    normalizedImageUrls[0] ||
    productImageMap[visual] ||
    "";
  const galleryImages = normalizedImageUrls.length
    ? normalizedImageUrls
    : primaryImage
      ? [primaryImage]
      : [productImageMap[visual] || productImageMap.grain];

  return {
    id: Number(product.id),
    categoryId: Number(product.categoryId || categoryIds[0] || 0),
    categoryIds,
    name: product.name,
    slug: product.slug || slugify(product.name),
    description: product.description || "Fresh grocery item from AK General Store.",
    price: Number(product.price || 0),
    originalPrice: Number(product.originalPrice || product.price || 0),
    unit: product.unit || "1 unit",
    imageUrl: primaryImage || productImageMap[visual] || "",
    imageUrls: galleryImages,
    image: visual,
    featured: Boolean(product.featured),
  };
}

export function getFallbackProductImage(product = {}) {
  const visual =
    product.image ||
    categoryVisualMap[Number(product.categoryId)] ||
    inferVisual(product);

  return productImageMap[visual] || productImageMap.grain;
}
