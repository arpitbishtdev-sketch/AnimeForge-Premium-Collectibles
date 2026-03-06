import { useState, useEffect, useCallback } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/products`;

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : (data.products ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ✅ Listen for global status color updates
  useEffect(() => {
    const handler = async () => {
      const res = await fetch("/api/status");
      const statuses = await res.json();

      setProducts((prev) =>
        prev.map((product) => {
          const match = statuses.find(
            (s) => s.status?.toLowerCase() === product.status?.toLowerCase(),
          );

          return {
            ...product,
            themeColor: match?.color || product.themeColor,
          };
        }),
      );
    };

    window.addEventListener("statusUpdated", handler);

    return () => {
      window.removeEventListener("statusUpdated", handler);
    };
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const token = localStorage.getItem("adminToken");

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prev) => prev.filter((p) => (p._id ?? p.id) !== id));
    } catch {
      alert("Failed to delete product");
    }
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }, []);

  const filtered = products
    .filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const { key, dir } = sortConfig;
      const av = a[key] ?? "";
      const bv = b[key] ?? "";
      const cmp =
        typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));

      return dir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    products: paginated,
    totalProducts: filtered.length,
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
  };
}
