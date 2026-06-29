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
  const normalized = String(value ?? "true").trim().toLowerCase();
  return !["false", "no", "0", "inactive"].includes(normalized);
}

function buildSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeCategoryRow(row) {
  const name = String(row.name || "").trim();
  const slug = String(row.slug || "").trim();

  return {
    name,
    slug: slug || buildSlug(name),
    imageUrl: String(row.imageUrl || row.imageurl || "").trim(),
    active: toBoolean(row.active),
  };
}

export async function parseCategoryImportFile(file) {
  const text = await file.text();
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "json") {
    const parsed = JSON.parse(text);
    const rows = Array.isArray(parsed) ? parsed : parsed.categories;
    if (!Array.isArray(rows)) {
      throw new Error("JSON file should contain an array of categories or a categories array.");
    }
    return rows.map(normalizeCategoryRow);
  }

  const csvRows = parseCsvRows(text);
  if (csvRows.length < 2) {
    throw new Error("CSV should include a header row and at least one category row.");
  }

  const headers = csvRows[0].map(normalizeHeader);
  return csvRows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] || "";
    });
    return normalizeCategoryRow(record);
  });
}

export function validateCategoryImportRows(categories) {
  const errors = [];

  categories.forEach((category, index) => {
    const rowNumber = index + 1;
    if (!category.name) {
      errors.push(`Row ${rowNumber}: name is required.`);
    }
    if (!category.slug) {
      errors.push(`Row ${rowNumber}: slug could not be generated.`);
    }
  });

  return errors;
}

export function buildSampleCategoryCsv() {
  return [
    "name,slug,imageUrl,active",
    '"Biscuits & Snacks","snacks","",true',
    '"Cold Drinks","cold-drinks","",true',
    '"Personal Care","personal-care","",true',
  ].join("\n");
}
