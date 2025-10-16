"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiTrash2,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiX,
  FiLoader,
} from "react-icons/fi";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectToken, clearSession } from "@/store/sessionSlice";

const API_BASE = "https://api.bitechx.com";

export default function ProductsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
    name: "",
  });
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const pageSizeDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const pageSizeOptions = [5, 10, 15, 20];
  const topRef = useRef(null);

  useEffect(() => {
    const t =
      typeof window !== "undefined"
        ? localStorage.getItem("bitechx_token")
        : "";
    if (!token && !t) router.replace("/login");
  }, [token, router]);

  const ax = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE,
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });
    instance.interceptors.request.use((cfg) => {
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      return cfg;
    });
    instance.interceptors.response.use(
      (r) => r,
      (e) => {
        if (e?.response?.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("bitechx_token");
            localStorage.removeItem("bitechx_email");
          }
          dispatch(clearSession());
          router.replace("/login");
        }
        return Promise.reject(e);
      }
    );
    return instance;
  }, [token, router, dispatch]);

  const debounceRef = useRef(null);
  const triggerFetch = useCallback((fn, delay = 350) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, delay);
  }, []);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await ax.get("/categories");
      setCategories(res.data || []);
    } catch {
      setCategories([]);
    }
  }, [ax, token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      if (searchText.trim().length >= 2) {
        const q = encodeURIComponent(searchText.trim());
        const res = await ax.get(`/products/search?searchedText=${q}`);
        let list = res.data || [];
        if (selectedCategoryId !== "all")
          list = list.filter((p) => p?.category?.id === selectedCategoryId);
        setProducts(list);
        setTotal(list.length);
        setPage(1);
      } else {
        const offset = (page - 1) * limit;
        const res2 = await ax.get(
          `/products?offset=${offset}&limit=${limit}${
            selectedCategoryId !== "all"
              ? `&categoryId=${selectedCategoryId}`
              : ""
          }`
        );
        const arr = res2.data || [];
        setProducts(arr);
        if (arr.length < limit && offset === 0) setTotal(arr.length);
        else if (
          offset === 0 &&
          page === 1 &&
          (arr.length === limit || arr.length === 0)
        )
          setTotal(50);
      }
    } catch {
      setErrorMessage("Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [ax, token, searchText, page, limit, selectedCategoryId]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts();
    }, 350);
  }, [fetchProducts]);

  useEffect(() => {
    triggerFetch(fetchProducts);
  }, [fetchProducts, triggerFetch]);

  useEffect(() => {
    function onDocClick(e) {
      if (
        pageSizeDropdownRef.current &&
        !pageSizeDropdownRef.current.contains(e.target)
      )
        setIsPageSizeOpen(false);
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target)
      )
        setIsCategoryOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleConfirmDelete = (product) =>
    setConfirmDelete({ open: true, id: product.id, name: product.name });

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    setIsDeletingId(confirmDelete.id);
    try {
      await ax.delete(`/products/${confirmDelete.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
    } catch {
      setErrorMessage("Failed to delete product. Please try again.");
    } finally {
      setIsDeletingId(null);
      setConfirmDelete({ open: false, id: null, name: "" });
    }
  };

  const pageCount = useMemo(
    () => (total ? Math.max(1, Math.ceil(total / limit)) : 1),
    [total, limit]
  );
  const canPrev = page > 1;
  const canNext = page < pageCount;

  const scrollToTop = () => {
    if (topRef.current)
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    else if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    if (!canPrev || isLoading) return;
    setPage((p) => p - 1);
    scrollToTop();
  };

  const goNext = () => {
    if (!canNext || isLoading || searchText.trim().length >= 2) return;
    setPage((p) => p + 1);
    scrollToTop();
  };

  return (
    <main className="min-h-screen bg-mist text-ink p-6">
      <div ref={topRef} />
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          </div>
          <div className="relative w-full sm:w-80">
            <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center">
              <FiSearch className="text-ink" />
            </span>
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name..."
              className="w-full rounded-xl border border-ink/15 bg-mist text-ink pl-10 pr-3 py-2 placeholder-ink/40 outline-none focus:ring-2 focus:ring-verdant/60"
            />
          </div>
        </header>

        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center justify-between gap-4">
            <div ref={categoryDropdownRef} className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-mist text-ink px-3 py-2 cursor-pointer hover:bg-mist/80 focus:outline-none focus:ring-2 focus:ring-verdant/60"
                aria-haspopup="listbox"
                aria-expanded={isCategoryOpen}
                onClick={() => setIsCategoryOpen((o) => !o)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsCategoryOpen(false);
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsCategoryOpen((o) => !o);
                  }
                }}
              >
                {selectedCategoryId === "all"
                  ? "All categories"
                  : categories.find((c) => c.id === selectedCategoryId)?.name ||
                    "Category"}
                <FiChevronDown
                  className={`${isCategoryOpen ? "rotate-180" : ""} transition`}
                />
              </button>
              {isCategoryOpen && (
                <div
                  className="absolute left-0 z-20 mt-2 w-56 rounded-lg bg-mist text-ink shadow-xl ring-1 ring-ink/10"
                  role="listbox"
                >
                  <span className="absolute -top-2 left-4 h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-mist" />
                  <ul className="max-h-72 overflow-auto py-2">
                    <li>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedCategoryId === "all"}
                        className={`block w-full text-left px-3 py-2 cursor-pointer rounded-md ${
                          selectedCategoryId === "all"
                            ? "bg-verdant/10 text-ink"
                            : "hover:bg-verdant/10"
                        }`}
                        onClick={() => {
                          setSelectedCategoryId("all");
                          setPage(1);
                          setIsCategoryOpen(false);
                          scrollToTop();
                        }}
                      >
                        All categories
                      </button>
                    </li>
                    {categories.map((c) => {
                      const active = c.id === selectedCategoryId;
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            className={`block w-full text-left px-3 py-2 cursor-pointer rounded-md ${
                              active
                                ? "bg-verdant/10 text-ink"
                                : "hover:bg-verdant/10"
                            }`}
                            onClick={() => {
                              setSelectedCategoryId(c.id);
                              setPage(1);
                              setIsCategoryOpen(false);
                              scrollToTop();
                            }}
                          >
                            {c.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div ref={pageSizeDropdownRef} className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-mist text-ink px-3 py-2 cursor-pointer hover:bg-mist/80 focus:outline-none focus:ring-2 focus:ring-verdant/60"
                aria-haspopup="listbox"
                aria-expanded={isPageSizeOpen}
                onClick={() => setIsPageSizeOpen((o) => !o)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsPageSizeOpen(false);
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsPageSizeOpen((o) => !o);
                  }
                }}
              >
                {limit} per page
                <FiChevronDown
                  className={`${isPageSizeOpen ? "rotate-180" : ""} transition`}
                />
              </button>
              {isPageSizeOpen && (
                <div
                  className="absolute left-0 z-20 mt-2 w-40 rounded-lg bg-mist text-ink shadow-xl ring-1 ring-ink/10"
                  role="listbox"
                >
                  <span className="absolute -top-2 left-4 h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-mist" />
                  <ul className="max-h-60 overflow-auto py-2">
                    {pageSizeOptions.map((n) => {
                      const active = n === limit;
                      return (
                        <li key={n}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            className={`block w-full text-left px-3 py-2 cursor-pointer rounded-md ${
                              active
                                ? "bg-verdant/10 text-ink"
                                : "hover:bg-verdant/10"
                            }`}
                            onClick={() => {
                              setLimit(n);
                              setPage(1);
                              setIsPageSizeOpen(false);
                              scrollToTop();
                            }}
                          >
                            {n} per page
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-16 text-ink/70">
              <FiLoader className="h-5 w-5 animate-spin" />
              <span>Loading products…</span>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-rust/10 px-3 py-3 text-rust">
              <FiAlertTriangle />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isLoading && !errorMessage && products.length === 0 && (
            <div className="flex items-center justify-center py-16 text-ink/60">
              No products found.
            </div>
          )}

          {!isLoading && !errorMessage && products.length > 0 && (
            <>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <li
                    key={p.id}
                    className="group relative overflow-hidden rounded-xl bg-mist text-ink ring-1 ring-ink/10 shadow flex flex-col"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-ink/5">
                      <img
                        src={
                          p.images?.[0] ||
                          "https://via.placeholder.com/640x480?text=No+Image"
                        }
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 flex flex-col grow">
                      <h3 className="line-clamp-1 font-semibold">{p.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-ink/70">
                        {p.description || "No description"}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-verdant font-semibold">
                          ${p.price}
                        </span>
                        <span className="text-xs text-ink/60">
                          {p?.category?.name || "—"}
                        </span>
                      </div>
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <Link
                          href={`/products/${p.slug}`}
                          className="cursor-pointer rounded-lg bg-verdant px-3 py-2 text-mist hover:bg-verdant/90"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => handleConfirmDelete(p)}
                          className="inline-flex items-center gap-2 rounded-lg bg-rust px-3 py-2 text-mist hover:bg-rust/90 cursor-pointer disabled:opacity-60"
                          disabled={isDeletingId === p.id}
                          title="Delete product"
                        >
                          <FiTrash2 />
                          {isDeletingId === p.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <nav className="mt-6 w-full rounded-full border border-ink/10 bg-mist shadow-[0_6px_18px_rgba(0,0,0,0.06)] px-2 py-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={goPrev}
                    disabled={!canPrev || isLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-verdant px-4 py-2 text-mist hover:bg-verdant/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="shrink-0" />
                    
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-ink/60">Page</span>
                    <span className="inline-flex items-center rounded-full border border-ink/15 bg-mist/80 px-3 py-1 text-sm font-medium">
                      {page}
                    </span>
                    <span className="text-sm text-ink/60">of</span>
                    <span className="inline-flex items-center rounded-full border border-ink/15 bg-mist/80 px-3 py-1 text-sm font-medium">
                      {pageCount}
                    </span>
                  </div>

                  <button
                    onClick={goNext}
                    disabled={
                      !canNext || isLoading || searchText.trim().length >= 2
                    }
                    title={
                      searchText.trim().length >= 2
                        ? "Pagination disabled during search"
                        : ""
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-verdant px-4 py-2 text-mist hover:bg-verdant/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    
                    <FiChevronRight className="shrink-0" />
                  </button>
                </div>
              </nav>
            </>
          )}
        </section>
      </div>

      {confirmDelete.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/20">
          <div className="relative w-full max-w-sm rounded-2xl bg-mist p-6 text-ink shadow-xl ring-1 ring-ink/10">
            <button
              onClick={() =>
                setConfirmDelete({ open: false, id: null, name: "" })
              }
              className="absolute right-3 top-3 rounded-full p-2 text-ink/60 hover:text-ink cursor-pointer"
              aria-label="Close confirm dialog"
            >
              <FiX />
            </button>
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="mt-1 h-5 w-5 text-rust" />
              <div>
                <h4 className="font-semibold">Delete product?</h4>
                <p className="mt-1 text-sm text-ink/70">
                  This will simulate deletion of{" "}
                  <span className="font-medium">{confirmDelete.name}</span>.
                  Continue?
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() =>
                  setConfirmDelete({ open: false, id: null, name: "" })
                }
                className="rounded-lg border border-ink/15 bg-mist px-4 py-2 text-ink hover:bg-mist/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-rust px-4 py-2 text-mist hover:bg-rust/90 cursor-pointer disabled:opacity-60"
                disabled={isDeletingId === confirmDelete.id}
              >
                {isDeletingId === confirmDelete.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
