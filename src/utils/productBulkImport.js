function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      cell += '"';
      index++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index++;
      }
      row.push(cell.trim());
      cell = "";
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toBoolean(value) {
  return ["true", "yes", "1", "featured"].includes(String(value || "").trim().toLowerCase());
}

function toNumber(value) {
  const parsed = Number(String(value || "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveCategoryId(row, categories) {
  const categoryId = toNumber(row.categoryId || row.categoryid);
  if (categoryId) {
    return categoryId;
  }

  const categoryName = String(row.categoryName || row.categoryname || "").trim().toLowerCase();
  if (!categoryName) {
    return 0;
  }

  return Number(
    categories.find(
      (category) =>
        String(category.name || "").trim().toLowerCase() === categoryName ||
        String(category.slug || "").trim().toLowerCase() === categoryName
    )?.id || 0
  );
}

function normalizeProductRow(row, categories) {
  const imageUrls = String(row.imageUrls || row.imageurls || "")
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);
  const imageUrl = String(row.imageUrl || row.imageurl || "").trim();

  return {
    name: String(row.name || "").trim(),
    description: String(row.description || "").trim(),
    price: toNumber(row.price),
    originalPrice: toNumber(row.originalPrice || row.originalprice || row.price),
    unit: String(row.unit || "").trim(),
    categoryId: resolveCategoryId(row, categories),
    imageUrl: imageUrl || imageUrls[0] || "",
    imageUrls: imageUrls.length ? imageUrls : imageUrl ? [imageUrl] : [],
    featured: toBoolean(row.featured),
  };
}

export async function parseProductImportFile(file, categories) {
  const text = await file.text();
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "json") {
    const parsed = JSON.parse(text);
    const rows = Array.isArray(parsed) ? parsed : parsed.products;
    if (!Array.isArray(rows)) {
      throw new Error("JSON file should contain an array of products or a products array.");
    }
    return rows.map((row) => normalizeProductRow(row, categories));
  }

  const csvRows = parseCsvRows(text);
  if (csvRows.length < 2) {
    throw new Error("CSV should include a header row and at least one product row.");
  }

  const headers = csvRows[0].map(normalizeHeader);
  return csvRows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] || "";
    });
    return normalizeProductRow(record, categories);
  });
}

export function validateProductImportRows(products) {
  const errors = [];

  products.forEach((product, index) => {
    const rowNumber = index + 1;
    if (!product.name) {
      errors.push(`Row ${rowNumber}: name is required.`);
    }
    if (!product.price || product.price <= 0) {
      errors.push(`Row ${rowNumber}: valid price is required.`);
    }
    if (!product.categoryId) {
      errors.push(`Row ${rowNumber}: categoryId or categoryName is required.`);
    }
  });

  return errors;
}

export function buildSampleProductCsv(categories = []) {
  const fallbackCategory = categories[0] || { id: 1, name: "Biscuits & Snacks" };
  return [
    "name,description,price,originalPrice,unit,categoryId,categoryName,imageUrl,imageUrls,featured",
    `"Parle-G - Mini Pack","Small biscuit pack",5,5,"1 pack",${fallbackCategory.id},"${fallbackCategory.name}","","",true`,
    `"Parle-G - Family Pack","Family biscuit pack",50,55,"1 pack",${fallbackCategory.id},"${fallbackCategory.name}","","",false`,
    `"Kurkure - Masala Munch","Crunchy snack pack",20,20,"1 pack",${fallbackCategory.id},"${fallbackCategory.name}","","",false`,
  ].join("\n");
}
