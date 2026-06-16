const STRUCTURE_SEPARATORS = [" - ", " | ", ": "];

export function parseProductCatalogStructure(name) {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) {
    return { familyName: "", displayName: "", structured: false };
  }

  for (const separator of STRUCTURE_SEPARATORS) {
    if (!normalizedName.includes(separator)) {
      continue;
    }

    const [familyName, ...rest] = normalizedName.split(separator);
    const displayName = rest.join(separator).trim();
    if (familyName.trim() && displayName) {
      return {
        familyName: familyName.trim(),
        displayName,
        structured: true,
      };
    }
  }

  return {
    familyName: "",
    displayName: normalizedName,
    structured: false,
  };
}

export function groupProductsByFamily(products = []) {
  const groups = [];
  const groupIndexByKey = new Map();

  products.forEach((product) => {
    const structure = parseProductCatalogStructure(product?.name);
    const groupKey = structure.structured ? structure.familyName.toLowerCase() : "__ungrouped__";

    if (!groupIndexByKey.has(groupKey)) {
      groupIndexByKey.set(groupKey, groups.length);
      groups.push({
        key: groupKey,
        title: structure.structured ? structure.familyName : "More in this category",
        structured: structure.structured,
        items: [],
      });
    }

    groups[groupIndexByKey.get(groupKey)].items.push({
      ...product,
      catalogFamilyName: structure.familyName,
      catalogDisplayName: structure.displayName,
      catalogStructured: structure.structured,
    });
  });

  return groups;
}
