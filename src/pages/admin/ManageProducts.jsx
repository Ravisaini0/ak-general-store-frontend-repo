import { Boxes, ImagePlus, Search, Sparkles, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  updateProduct,
  uploadProductImage,
} from "../../services/productService";
import { formatPrice } from "../../utils/formatPrice";
import {
  getImageUploadSupportText,
  PRODUCT_IMAGE_MAX_BYTES,
  validateImageUploadFile,
} from "../../utils/imageUploadRules";
import { parseProductCatalogStructure } from "../../utils/catalogStructure";
import { getFallbackProductImage } from "../../utils/storeMappers";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  unit: "",
  categoryId: "",
  imageUrl: "",
  imageUrls: [""],
  featured: false,
};

function sanitizeGalleryUrls(imageUrls = []) {
  return imageUrls
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 8);
}

function getProductSearchText(product, categoryName) {
  return [
    product.name,
    product.description,
    categoryName,
    product.unit,
    product.featured ? "featured" : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState({ type: "", message: "" });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [featuredFilter, setFeaturedFilter] = useState("ALL");
  const imageUploadSupportText = getImageUploadSupportText(PRODUCT_IMAGE_MAX_BYTES);
  const namingPreview = parseProductCatalogStructure(form.name);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const [productList, categoryList] = await Promise.all([fetchProducts(), fetchCategories()]);
        setProducts(productList);
        setCategories(categoryList);
      } catch (loadError) {
        setError(loadError.message || "Products could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryName = categoryMap[product.categoryId] || "Uncategorized";
      const queryMatch =
        !search.trim() || getProductSearchText(product, categoryName).includes(search.trim().toLowerCase());
      const categoryMatch =
        categoryFilter === "ALL" || String(product.categoryId) === String(categoryFilter);
      const featuredMatch =
        featuredFilter === "ALL" ||
        (featuredFilter === "FEATURED" && product.featured) ||
        (featuredFilter === "STANDARD" && !product.featured);

      return queryMatch && categoryMatch && featuredMatch;
    });
  }, [categoryFilter, categoryMap, featuredFilter, products, search]);

  const inventoryValue = useMemo(
    () => filteredProducts.reduce((sum, product) => sum + Number(product.price || 0), 0),
    [filteredProducts]
  );

  const totalGalleryImages = useMemo(
    () =>
      filteredProducts.reduce(
        (sum, product) => sum + (product.imageUrls?.length || (product.imageUrl ? 1 : 0)),
        0
      ),
    [filteredProducts]
  );

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setUploadFeedback({ type: "", message: "" });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    const normalizedImageUrls = sanitizeGalleryUrls(
      product.imageUrls && product.imageUrls.length ? product.imageUrls : [product.imageUrl || ""]
    );

    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price || ""),
      originalPrice: String(product.originalPrice || ""),
      unit: product.unit || "",
      categoryId: String(product.categoryId || ""),
      imageUrl: product.imageUrl || "",
      imageUrls: normalizedImageUrls.length ? normalizedImageUrls : [""],
      featured: Boolean(product.featured),
    });
    setError("");
    setUploadFeedback({ type: "", message: "" });
    setShowModal(true);
  };

  const handleImageFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const invalidMessage = files
      .map((file) => validateImageUploadFile(file, { maxBytes: PRODUCT_IMAGE_MAX_BYTES }))
      .find(Boolean);
    if (invalidMessage) {
      setUploadFeedback({ type: "error", message: invalidMessage });
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      setUploadFeedback({ type: "", message: "" });
      const uploadedUrls = [];
      for (const file of files) {
        uploadedUrls.push(await uploadProductImage(file));
      }
      setForm((current) => {
        const nextImageUrls = sanitizeGalleryUrls([...(current.imageUrls || []), ...uploadedUrls]);
        return {
          ...current,
          imageUrl: nextImageUrls[0] || current.imageUrl,
          imageUrls: nextImageUrls.length ? nextImageUrls : [""],
        };
      });
      setUploadFeedback({
        type: "success",
        message: `${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s were" : " was"} uploaded successfully.`,
      });
    } catch (uploadError) {
      setUploadFeedback({
        type: "error",
        message: uploadError.message || "Product image could not be uploaded.",
      });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice || form.price),
        unit: form.unit,
        categoryId: Number(form.categoryId),
        imageUrl:
          sanitizeGalleryUrls(form.imageUrls)[0] ||
          form.imageUrl ||
          getFallbackProductImage({
            name: form.name,
            categoryId: Number(form.categoryId),
          }),
        imageUrls: sanitizeGalleryUrls(form.imageUrls),
        featured: Boolean(form.featured),
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts((current) =>
          current.map((product) => (product.id === updated.id ? updated : product))
        );
      } else {
        const created = await createProduct(payload);
        setProducts((current) => [created, ...current]);
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditingProduct(null);
      setUploadFeedback({ type: "", message: "" });
    } catch (submitError) {
      setError(submitError.message || "Product could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateImageUrl = (index, value) => {
    setForm((current) => {
      const nextImageUrls = [...current.imageUrls];
      nextImageUrls[index] = value;
      const normalizedImageUrls = sanitizeGalleryUrls(nextImageUrls);
      return {
        ...current,
        imageUrl: normalizedImageUrls[0] || "",
        imageUrls: nextImageUrls,
      };
    });
  };

  const addImageUrlField = () => {
    setForm((current) => ({
      ...current,
      imageUrls: [...current.imageUrls, ""],
    }));
  };

  const removeImageUrlField = (index) => {
    setForm((current) => {
      const nextImageUrls = current.imageUrls.filter((_, imageIndex) => imageIndex !== index);
      const normalizedImageUrls = sanitizeGalleryUrls(nextImageUrls);
      return {
        ...current,
        imageUrl: normalizedImageUrls[0] || "",
        imageUrls: nextImageUrls.length ? nextImageUrls : [""],
      };
    });
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) {
      return;
    }

    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (deleteError) {
      setError(deleteError.message || "Product could not be deleted.");
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
                <h1 className="text-3xl font-black text-slate-950">Manage Products</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-500">
                  Operate the live product catalog with better inventory visibility, gallery control, and category-level merchandising.
                </p>
              </div>
              <Button
                variant="accent"
                className="w-full gap-2 px-5 py-3 font-black sm:w-auto"
                onClick={openCreateModal}
              >
                <ImagePlus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <Boxes className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Visible catalog items</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{filteredProducts.length}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <Sparkles className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Featured products</p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {filteredProducts.filter((product) => product.featured).length}
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <Tag className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Filtered catalog value</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{formatPrice(inventoryValue)}</p>
                <p className="mt-2 text-sm text-slate-500">{totalGalleryImages} gallery image assets</p>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_180px]">
              <label className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="Search by product name, description, unit, or category"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select
                className="store-input"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="ALL">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                className="store-input"
                value={featuredFilter}
                onChange={(event) => setFeaturedFilter(event.target.value)}
              >
                <option value="ALL">All Product Types</option>
                <option value="FEATURED">Featured Only</option>
                <option value="STANDARD">Standard Only</option>
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
              Loading products...
            </div>
          ) : filteredProducts.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const previewImage =
                  (product.imageUrls && product.imageUrls[0]) ||
                  product.imageUrl ||
                  getFallbackProductImage(product);
                const categoryName = categoryMap[product.categoryId] || "Uncategorized";
                const imageCount = product.imageUrls?.length || 1;

                return (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                      <img
                        src={previewImage}
                        alt={product.name}
                        className="h-40 w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                      <div className="absolute inset-0 flex hidden items-center justify-center bg-slate-100 px-4 text-center text-sm font-semibold text-slate-500">
                        Product image unavailable
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                            {categoryName}
                          </p>
                          {product.name.includes(" - ") ? (
                            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-yellow-700">
                              Structured family item
                            </p>
                          ) : null}
                          <h2 className="mt-2 truncate text-xl font-black text-slate-950">
                            {product.name}
                          </h2>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            product.featured
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {product.featured ? "Featured" : "Standard"}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                        {product.description || "Fresh grocery item from AK General Store."}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="rounded-full bg-slate-100 px-3 py-1">{product.unit}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {imageCount} image{imageCount > 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-lg font-black text-slate-950">{formatPrice(product.price)}</p>
                          {Number(product.originalPrice || 0) > Number(product.price || 0) ? (
                            <p className="text-xs font-semibold text-slate-400 line-through">
                              {formatPrice(product.originalPrice)}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white"
                            onClick={() => openEditModal(product)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-xl border border-red-200 px-4 py-2 text-xs font-black text-red-600"
                            onClick={() => handleDelete(product)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No products matched the current search or catalog filters.
            </div>
          )}
        </main>
      </div>

      <Modal
        open={showModal}
        title={editingProduct ? "Edit Product" : "Add Product"}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
      >
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            className="store-input md:col-span-2"
            placeholder="Product name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            For category-inside-category structure, use product names like{" "}
            <span className="font-black text-slate-900">Parle-G - Mini Pack</span>,{" "}
            <span className="font-black text-slate-900">Parle-G - Family Pack</span>,{" "}
            <span className="font-black text-slate-900">Good Day - Mini Pack</span>.
            {namingPreview.structured ? (
              <span className="mt-2 block text-xs text-slate-500">
                Preview: family <span className="font-bold text-slate-900">{namingPreview.familyName}</span> / item{" "}
                <span className="font-bold text-slate-900">{namingPreview.displayName}</span>
              </span>
            ) : null}
          </div>
          <textarea
            className="store-input min-h-[120px] md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />
          <input
            className="store-input"
            placeholder="Price"
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
          />
          <input
            className="store-input"
            placeholder="Original price"
            value={form.originalPrice}
            onChange={(event) =>
              setForm((current) => ({ ...current, originalPrice: event.target.value }))
            }
          />
          <input
            className="store-input"
            placeholder="Unit"
            value={form.unit}
            onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
          />
          <select
            className="store-input"
            value={form.categoryId}
            onChange={(event) =>
              setForm((current) => ({ ...current, categoryId: event.target.value }))
            }
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Product Gallery</p>
                <p className="mt-1 text-xs text-slate-500">
                  Add multiple image URLs or upload multiple product images for the storefront gallery.
                </p>
              </div>
              <button
                type="button"
                onClick={addImageUrlField}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-800"
              >
                Add Image Field
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {form.imageUrls.map((imageUrl, index) => (
                <div key={`image-${index}`} className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className="store-input w-full"
                    placeholder={`Image URL ${index + 1}`}
                    value={imageUrl}
                    onChange={(event) => updateImageUrl(index, event.target.value)}
                  />
                  {form.imageUrls.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeImageUrlField(index)}
                      className="rounded-xl border border-red-200 px-4 py-3 text-xs font-black text-red-600"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm font-bold text-slate-900">Upload Product Images</p>
            <p className="mt-1 text-xs text-slate-500">
              Choose one or many files. Uploaded images will be added to the gallery automatically.
            </p>
            <p className="mt-2 text-xs text-slate-500">{imageUploadSupportText}</p>
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
            <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
              {uploadingImage ? "Uploading..." : "Choose Images"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={handleImageFileChange}
                disabled={uploadingImage}
              />
            </label>

            {form.imageUrls.some((value) => value.trim()) ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {sanitizeGalleryUrls(form.imageUrls).map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                      <img
                        src={imageUrl}
                        alt={`Product preview ${index + 1}`}
                        className="h-40 w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                      <div className="absolute inset-0 flex hidden items-center justify-center bg-slate-100 px-4 text-center text-sm font-semibold text-slate-500">
                        Product image unavailable
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600">
                      <span>Image {index + 1}</span>
                      <button
                        type="button"
                        className="text-red-600"
                        onClick={() =>
                          removeImageUrlField(
                            form.imageUrls.findIndex((value) => value === imageUrl)
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : form.name || form.categoryId ? (
              <div className="mt-4">
                <img
                  src={getFallbackProductImage({
                    name: form.name,
                    categoryId: Number(form.categoryId),
                  })}
                  alt="Product preview"
                  className="h-40 w-full rounded-2xl object-cover"
                />
              </div>
            ) : null}
          </div>

          <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                setForm((current) => ({ ...current, featured: event.target.checked }))
              }
            />
            Mark as featured product
          </label>

          <Button variant="accent" className="w-full py-4 font-black md:col-span-2" type="submit">
            {submitting ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
