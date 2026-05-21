const searchAliases = {
  atta: ["atta", "aata", "flour", "wheat", "chakki"],
  aata: ["aata", "atta", "flour", "wheat", "chakki"],
  flour: ["flour", "atta", "aata", "wheat", "chakki"],
  dal: ["dal", "dall", "lentil", "lentils", "pulse", "pulses"],
  lentil: ["lentil", "lentils", "dal", "pulse", "pulses"],
  lentils: ["lentils", "lentil", "dal", "pulse", "pulses"],
  rice: ["rice", "basmati", "grain", "grains"],
  oil: ["oil", "ghee", "mustard", "sunflower"],
  ghee: ["ghee", "oil", "mustard", "sunflower"],
  masala: ["masala", "spice", "spices", "seasoning"],
  spice: ["spice", "spices", "masala", "seasoning"],
  spices: ["spices", "spice", "masala", "seasoning"],
  snacks: ["snack", "snacks", "namkeen", "biscuits", "biscuit"],
  snack: ["snack", "snacks", "namkeen", "biscuits", "biscuit"],
  biscuit: ["biscuit", "biscuits", "snack", "snacks", "namkeen"],
  biscuits: ["biscuits", "biscuit", "snack", "snacks", "namkeen"],
};

function tokenize(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function normalizeSearchTokens(rawSearch = "") {
  const normalized = tokenize(rawSearch);

  return Array.from(
    new Set(normalized.flatMap((token) => searchAliases[token] || [token]))
  );
}

export function scoreProductMatch(product, categories = [], rawSearch = "") {
  if (!rawSearch.trim()) {
    return 0;
  }

  const tokens = normalizeSearchTokens(rawSearch);
  const categoryName =
    categories.find((item) => Number(item.id) === Number(product.categoryId))?.name || "";
  const productName = (product.name || "").toLowerCase();
  const productSlug = (product.slug || "").toLowerCase();
  const description = (product.description || "").toLowerCase();
  const unit = (product.unit || "").toLowerCase();
  const category = categoryName.toLowerCase();
  const haystack = `${productName} ${productSlug} ${description} ${unit} ${category}`;
  const exactQuery = rawSearch.trim().toLowerCase();

  let score = 0;

  if (productName === exactQuery) score += 150;
  if (productSlug === exactQuery.replace(/\s+/g, "-")) score += 130;
  if (productName.includes(exactQuery)) score += 90;
  if (productSlug.includes(exactQuery)) score += 80;
  if (category.includes(exactQuery)) score += 45;

  for (const token of tokens) {
    if (productName.startsWith(token)) score += 30;
    if (productName.includes(token)) score += 22;
    if (productSlug.includes(token)) score += 18;
    if (category.includes(token)) score += 14;
    if (description.includes(token)) score += 9;
    if (unit.includes(token)) score += 4;
  }

  return haystack.includes(exactQuery) || tokens.some((token) => haystack.includes(token))
    ? score
    : 0;
}

export function sortProductsBySearchRelevance(products, categories = [], rawSearch = "") {
  if (!rawSearch.trim()) {
    return [...products];
  }

  return [...products]
    .map((product) => ({
      product,
      score: scoreProductMatch(product, categories, rawSearch),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.product.name.localeCompare(right.product.name);
    })
    .map((item) => item.product);
}
