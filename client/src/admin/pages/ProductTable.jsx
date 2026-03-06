import { useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import "../styles/ProductTable.css";

const STATUS_OPTIONS = [
  "all",
  "new",
  "popular",
  "rare",
  "featured",
  "bestseller",
  "ultra-rare",
];

const SORT_COLUMNS = [
  { key: "name", label: "Product" },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "basePrice", label: "Price" },
  { key: "stock", label: "Stock" },
];

function SortIcon({ active, dir }) {
  if (!active) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>;
  return (
    <span style={{ marginLeft: 4, color: "var(--text-accent)" }}>
      {dir === "asc" ? "↑" : "↓"}
    </span>
  );
}

function SkeletonRows() {
  return Array.from({ length: 6 }).map((_, i) => (
    <tr key={i} className="pt-skeleton">
      {Array.from({ length: 6 }).map((_, j) => (
        <td key={j}>
          <div
            className="pt-skeleton-line"
            style={{ width: j === 0 ? "80%" : "60%", opacity: 1 - i * 0.1 }}
          />
        </td>
      ))}
    </tr>
  ));
}

export default function ProductTable() {
  const navigate = useNavigate();
  const {
    products,
    totalProducts,
    isLoading,
    error,
    page,
    setPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortConfig,
    handleSort,
    handleDelete,
  } = useProducts();

  return (
    <div>
      {/* Page Header */}
      <header className="pt-page-header">
        <div>
          <h1 className="pt-page-title">Products</h1>
          <p className="pt-page-sub">
            {totalProducts} product{totalProducts !== 1 ? "s" : ""} in catalog
          </p>
        </div>
        <button
          className="pt-add-btn"
          onClick={() => navigate("/admin/products/add")}
        >
          ✚ Add Product
        </button>
      </header>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.3)",
            borderRadius: "var(--radius-md)",
            padding: "14px 18px",
            marginBottom: 20,
            color: "#f87171",
            fontSize: 14,
          }}
        >
          ⚠ Failed to load products: {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="pt-toolbar">
        <div className="pt-search-wrap">
          <span className="pt-search-icon">🔍</span>
          <input
            type="search"
            className="pt-search"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="pt-filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all"
                ? "All Status"
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="pt-table-wrap">
        <table className="pt-table" aria-label="Products table">
          <thead>
            <tr>
              {SORT_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`sortable ${sortConfig.key === col.key ? "sorted" : ""}`}
                  onClick={() => handleSort(col.key)}
                  aria-sort={
                    sortConfig.key === col.key
                      ? sortConfig.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {col.label}
                  <SortIcon
                    active={sortConfig.key === col.key}
                    dir={sortConfig.dir}
                  />
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="pt-empty">
                    <div className="pt-empty__icon">🎴</div>
                    <p className="pt-empty__text">
                      {searchQuery || statusFilter !== "all"
                        ? "No products match your filters."
                        : "No products yet. Add your first one!"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const id = product._id ?? product.id;
                const price = product.basePrice ?? product.price ?? 0;
                const stock = product.stock ?? 0;

                return (
                  <tr key={id}>
                    {/* Product cell */}
                    <td>
                      <div className="pt-product-cell">
                        <div className="pt-product-thumb">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                            />
                          ) : (
                            "🎴"
                          )}
                        </div>
                        <div>
                          <p className="pt-product-name">{product.name}</p>
                          <p className="pt-product-slug">/{product.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td
                      style={{ color: "var(--text-secondary)", fontSize: 13 }}
                    >
                      {product.category ?? "—"}
                    </td>

                    {/* Status */}
                    <td>
                      {product.status ? (
                        <span
                          className="pt-badge"
                          style={
                            product.themeColor
                              ? {
                                  "--badge-color": product.themeColor,
                                  "--badge-bg": `${product.themeColor}15`,
                                }
                              : {}
                          }
                        >
                          <span className="pt-badge__dot" />
                          {product.status}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    {/* Price */}
                    <td className="pt-price">
                      ₹{Number(price).toLocaleString("en-IN")}
                    </td>

                    {/* Stock */}
                    <td className={`pt-stock ${stock <= 5 ? "low" : ""}`}>
                      {stock <= 5 ? `⚠ ${stock}` : stock}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="pt-actions">
                        <button
                          className="pt-action-btn"
                          title="Edit"
                          aria-label={`Edit ${product.name}`}
                          onClick={() => navigate(`/admin/products/edit/${id}`)}
                        >
                          ✎
                        </button>
                        <button
                          className="pt-action-btn"
                          title="View"
                          aria-label={`View ${product.name}`}
                          onClick={() =>
                            window.open(`/product/${product.slug}`, "_blank")
                          }
                        >
                          ⊙
                        </button>
                        <button
                          className="pt-action-btn danger"
                          title="Delete"
                          aria-label={`Delete ${product.name}`}
                          onClick={() => handleDelete(id)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="pt-pagination">
            <span>
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, totalProducts)}{" "}
              of {totalProducts}
            </span>
            <div className="pt-page-btns">
              <button
                className="pt-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`pt-page-btn ${page === i + 1 ? "active" : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="pt-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
