import { FileDown, FolderTree, ImagePlus, Layers3, Search, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import {
  bulkImportCategories,
  createCategory,
  deleteCategory,
  fetchCategories,
  uploadCategoryImage,
  updateCategory,
} from "../../services/productService";
import {
  CATEGORY_IMAGE_MAX_BYTES,
  getImageUploadSupportText,
  validateImageUploadFile,
} from "../../utils/imageUploadRules";
import {
  buildSampleCategoryCsv,
  parseCategoryImportFile,
  validateCategoryImportRows,
} from "../../utils/categoryBulkImport";

const emptyForm = {
  name: "",
  slug: "",
  imageUrl: "",
  active: true,
};

function getCategoryPreview(category) {
  if (category?.imageUrl) {
    return category.imageUrl;
  }

  const slug = String(category?.slug || category?.name || "grocery").toLowerCase();
  if (slug.includes("aata") || slug.includes("flour")) {
    return "https://images.unsplash.com/photo-1600628422019-8d6f4b84f758?auto=format&fit=crop&w=800&q=80";
  }
  if (slug.includes("dal") || slug.includes("pulse")) {
    return "https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=800&q=80";
  }
  if (slug.includes("oil") || slug.includes("ghee")) {
    return "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80";
  }
  return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";
}

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState({ type: "", message: "" });
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkParsing, setBulkParsing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const imageUploadSupportText = getImageUploadSupportText(CATEGORY_IMAGE_MAX_BYTES);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        setError("");
        setCategories(await fetchCategories());
      } catch (loadError) {
        setError(loadError.message || "Categories could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const queryMatch =
        !search.trim() ||
        [category.name, category.slug]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search.trim().toLowerCase());

      const statusMatch =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && category.active) ||
        (statusFilter === "INACTIVE" && !category.active);

      return queryMatch && statusMatch;
    });
  }, [categories, search, statusFilter]);

  const coverageReadyCount = useMemo(
    () => filteredCategories.filter((category) => Boolean(category.imageUrl)).length,
    [filteredCategories]
  );

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setUploadFeedback({ type: "", message: "" });
    setShowModal(true);
  };

  const openBulkModal = () => {
    setBulkRows([]);
    setBulkErrors([]);
    setBulkResult(null);
    setShowBulkModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      imageUrl: category.imageUrl || "",
      active: category.active ?? true,
    });
    setUploadFeedback({ type: "", message: "" });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      const payload = {
        name: form.name,
        slug: form.slug,
        imageUrl: form.imageUrl,
        active: Boolean(form.active),
      };

      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, payload);
        setCategories((current) =>
          current.map((category) => (category.id === updated.id ? updated : category))
        );
      } else {
        const created = await createCategory(payload);
        setCategories((current) => [created, ...current]);
      }

      setShowModal(false);
      setEditingCategory(null);
      setForm(emptyForm);
    } catch (submitError) {
      setError(submitError.message || "Category could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete ${category.name}?`)) {
      return;
    }

    try {
      await deleteCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
    } catch (deleteError) {
      setError(deleteError.message || "Category could not be deleted.");
    }
  };

  const handleBulkFileChange = async (event) => {
    const [file] = Array.from(event.target.files || []);
    if (!file) {
      return;
    }

    try {
      setBulkParsing(true);
      setBulkResult(null);
      setBulkErrors([]);
      const parsedRows = await parseCategoryImportFile(file);
      const validationErrors = validateCategoryImportRows(parsedRows);
      setBulkRows(parsedRows);
      setBulkErrors(validationErrors);
    } catch (parseError) {
      setBulkRows([]);
      setBulkErrors([parseError.message || "Import file could not be read."]);
    } finally {
      setBulkParsing(false);
      event.target.value = "";
    }
  };

  const handleBulkImport = async () => {
    const validationErrors = validateCategoryImportRows(bulkRows);
    if (validationErrors.length) {
      setBulkErrors(validationErrors);
      return;
    }

    try {
      setBulkImporting(true);
      setBulkResult(null);
      setBulkErrors([]);
      const result = await bulkImportCategories(bulkRows);
      setBulkResult(result);
      setCategories((current) => {
        const importedMap = new Map((result.categories || []).map((category) => [category.id, category]));
        const merged = current.map((category) => importedMap.get(category.id) || category);
        const existingIds = new Set(current.map((category) => category.id));
        const createdCategories = (result.categories || []).filter((category) => !existingIds.has(category.id));
        return [...createdCategories, ...merged];
      });
      setBulkErrors(result.errors || []);
    } catch (importError) {
      setBulkErrors([importError.message || "Bulk category import could not be completed."]);
    } finally {
      setBulkImporting(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const csv = buildSampleCategoryCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ak-categories-import-sample.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImageUpload = async (event) => {
    const [file] = Array.from(event.target.files || []);
    if (!file) {
      return;
    }

    const invalidMessage = validateImageUploadFile(file, {
      maxBytes: CATEGORY_IMAGE_MAX_BYTES,
    });
    if (invalidMessage) {
      setUploadFeedback({ type: "error", message: invalidMessage });
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      setUploadFeedback({ type: "", message: "" });
      const imageUrl = await uploadCategoryImage(file);
      setForm((current) => ({ ...current, imageUrl }));
      setUploadFeedback({ type: "success", message: "Category image uploaded successfully." });
    } catch (uploadError) {
      setUploadFeedback({
        type: "error",
        message: uploadError.message || "Category image could not be uploaded.",
      });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <div className="admin-shell min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto grid max-w-[1480px] gap-6 xl:grid-cols-[248px_minmax(0,1fr)]">
        <AdminSidebar />
        <main className="min-w-0 overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-950">Manage Categories</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-500">
                  Structure the storefront taxonomy with better visibility into active groups, search surfaces, and image readiness.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="ghost"
                  className="w-full gap-2 px-5 py-3 font-black sm:w-auto"
                  onClick={openBulkModal}
                >
                  <Upload className="h-4 w-4" />
                  Bulk Import
                </Button>
                <Button
                  variant="accent"
                  className="w-full gap-2 px-5 py-3 font-black sm:w-auto"
                  onClick={openCreateModal}
                >
                  <ImagePlus className="h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <FolderTree className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Visible category groups</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{filteredCategories.length}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <ShieldCheck className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Active categories</p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {filteredCategories.filter((category) => category.active).length}
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <Layers3 className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Image ready groups</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{coverageReadyCount}</p>
                <p className="mt-2 text-sm text-slate-500">Cards with visual assets ready for storefront display</p>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px]">
              <label className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="Search by category name or slug"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select
                className="store-input"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Loading categories...
            </div>
          ) : filteredCategories.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    <img
                      src={getCategoryPreview(category)}
                      alt={category.name}
                      className="h-40 w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    <div className="absolute inset-0 flex hidden items-center justify-center bg-slate-100 px-4 text-center text-sm font-semibold text-slate-500">
                      Category image unavailable
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Category</p>
                        <h2 className="mt-2 truncate text-2xl font-black text-slate-950">
                          {category.name}
                        </h2>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {category.slug}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          category.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {category.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                      Used for storefront navigation, search grouping, and merchandising placement across the live catalog.
                    </p>

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white"
                        onClick={() => openEditModal(category)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border border-red-300 px-4 py-2 text-xs font-black text-red-700"
                        onClick={() => handleDelete(category)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No categories matched the current search or status filter.
            </div>
          )}
        </main>
      </div>

      <Modal
        open={showModal}
        title={editingCategory ? "Edit Category" : "Add Category"}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
        }}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            className="store-input"
            placeholder="Category name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="store-input"
            placeholder="Slug"
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
          />
          <input
            className="store-input"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
          />
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Category image</p>
                <p className="text-xs text-slate-500">
                  Upload a JPG, PNG, or WEBP image for storefront cards and category landing views.
                </p>
                <p className="mt-1 text-xs text-slate-500">{imageUploadSupportText}</p>
                {uploadFeedback.message ? (
                  <div
                    className={`mt-3 rounded-xl border px-3 py-3 text-sm ${
                      uploadFeedback.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {uploadFeedback.message}
                  </div>
                ) : null}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <span className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  {uploadingImage ? "Uploading..." : "Choose Image"}
                </span>
              </label>
            </div>
            {form.imageUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img
                  src={getCategoryPreview(form)}
                  alt={form.name || "Category preview"}
                  className="h-40 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <div className="absolute inset-0 flex hidden items-center justify-center bg-slate-100 px-4 text-center text-sm font-semibold text-slate-500">
                  Category image unavailable
                </div>
              </div>
            ) : null}
          </div>
          <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
            />
            Category is active
          </label>
          <Button variant="accent" className="w-full py-4 font-black" type="submit">
            {submitting ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
          </Button>
        </form>
      </Modal>

      <Modal
        open={showBulkModal}
        title="Bulk Import Categories"
        onClose={() => {
          if (!bulkImporting) {
            setShowBulkModal(false);
          }
        }}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Upload CSV or JSON with columns: name, slug, imageUrl, active. Existing slug will be
            updated, new slug will be created.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
              <Upload className="h-4 w-4" />
              {bulkParsing ? "Reading file..." : "Choose CSV / JSON"}
              <input
                type="file"
                accept=".csv,.json,text/csv,application/json"
                className="hidden"
                onChange={handleBulkFileChange}
                disabled={bulkParsing || bulkImporting}
              />
            </label>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={handleDownloadSampleCsv}
              disabled={bulkImporting}
            >
              <FileDown className="h-4 w-4" />
              Download Sample CSV
            </Button>
          </div>

          {bulkRows.length ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-slate-950">{bulkRows.length} categories ready</p>
                <Button
                  type="button"
                  variant="accent"
                  className="px-5 py-2 font-black"
                  onClick={handleBulkImport}
                  disabled={bulkImporting || bulkErrors.length > 0}
                >
                  {bulkImporting ? "Importing..." : "Import Categories"}
                </Button>
              </div>
              <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-slate-100">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Slug</th>
                      <th className="px-3 py-2">Image URL</th>
                      <th className="px-3 py-2">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkRows.slice(0, 25).map((row, index) => (
                      <tr key={`${row.slug}-${index}`} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-semibold text-slate-900">{row.name || "-"}</td>
                        <td className="px-3 py-2 text-slate-600">{row.slug || "-"}</td>
                        <td className="max-w-[220px] truncate px-3 py-2 text-slate-600">
                          {row.imageUrl || "-"}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{row.active ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {bulkRows.length > 25 ? (
                <p className="mt-2 text-xs text-slate-500">Showing first 25 rows only.</p>
              ) : null}
            </div>
          ) : null}

          {bulkResult ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Imported {bulkResult.totalRows} rows. Created {bulkResult.createdCount}, updated{" "}
              {bulkResult.updatedCount}, failed {bulkResult.failedCount}.
            </div>
          ) : null}

          {bulkErrors.length ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-black">Please fix these rows before importing:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {bulkErrors.slice(0, 8).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {bulkErrors.length > 8 ? (
                <p className="mt-2 text-xs">Showing first 8 errors.</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
