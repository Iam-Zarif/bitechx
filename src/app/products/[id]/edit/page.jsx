"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  FiChevronLeft,
  FiChevronDown,
  FiLoader,
  FiAlertTriangle,
} from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectToken, clearSession } from "@/store/sessionSlice";
import { Api } from "../../../../../Api";


export default function EditProduct() {
  const router = useRouter();
  const { id: slug } = useParams();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef(null);

  useEffect(() => {
    const t =
      typeof window !== "undefined"
        ? localStorage.getItem("bitechx_token")
        : "";
    if (!token && !t) router.replace("/login");
  }, [token, router]);

  const ax = useMemo(() => {
    const i = axios.create({
      baseURL: Api,
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });
    i.interceptors.request.use((cfg) => {
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      return cfg;
    });
    i.interceptors.response.use(
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
    return i;
  }, [token, router, dispatch]);

  useEffect(() => {
    function onDoc(e) {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!token || !slug) return;
    let mounted = true;

    async function load() {
      setLoading(true);
      setErrorMessage("");
      try {
        const [{ data: prod }, { data: cats }] = await Promise.all([
          ax.get(`/products/${slug}`),
          ax.get("/categories"),
        ]);

        if (!mounted) return;

        setProductId(prod.id);
        setName(prod.name || "");
        setDesc(prod.description || "");
        setPrice(String(prod.price ?? ""));
        setImageUrl(prod.images?.[0] || "");
        setCategoryId(prod?.category?.id || "");
        setCategories(cats || []);
      } catch {
        if (!mounted) return;
        setErrorMessage("Failed to load product for editing.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [ax, token, slug]);

  const validate = () => {
    if (!name.trim()) return "Name is required.";
    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) return "Price must be a number > 0.";
    if (!categoryId) return "Please choose a category.";
    if (imageUrl && !/^https?:\/\//i.test(imageUrl))
      return "Image URL must start with http or https.";
    return "";
  };

  const onSave = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErrorMessage(v);
      return;
    }
    if (!productId) {
      setErrorMessage("Product id missing.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    try {
      await ax.put(`/products/${productId}`, {
        name: name.trim(),
        description: desc.trim(),
        price: Number(price),
        images: imageUrl ? [imageUrl.trim()] : undefined,
        categoryId,
      });
      router.push(`/products`);
    } catch {
      setErrorMessage("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-mist text-ink grid place-items-center p-6">
        <div className="inline-flex items-center gap-3 rounded-xl bg-mist px-4 py-3 ring-1 ring-ink/10">
          <FiLoader className="h-5 w-5 animate-spin" />
          <span>Loading editor…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen  bg-mist text-ink p-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/products/${slug}`)}
            className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-mist px-3 py-2 hover:bg-mist/80 cursor-pointer"
          >
            <FiChevronLeft />
            Back
          </button>

          <h1 className="text-xl font-semibold tracking-tight">Edit product</h1>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-rust/10 px-3 py-3 text-rust">
            <FiAlertTriangle />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={onSave}
          className="space-y-5 rounded-2xl bg-mist p-5 ring-1 ring-ink/10"
        >
          <div className="space-y-2">
            <label className="block text-sm">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-mist/80 px-3 py-3 outline-none focus:ring-2 focus:ring-verdant/60"
              placeholder="Product name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-ink/15 bg-mist/80 px-3 py-3 outline-none focus:ring-2 focus:ring-verdant/60"
              placeholder="Describe the product"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-mist/80 px-3 py-3 outline-none focus:ring-2 focus:ring-verdant/60"
                placeholder="100.00"
              />
            </div>

            <div className="space-y-2" ref={categoryRef}>
              <label className="block text-sm">Category</label>
              <button
                type="button"
                className="w-full inline-flex items-center justify-between rounded-xl border border-ink/15 bg-mist/80 px-3 py-3 cursor-pointer hover:bg-mist focus:outline-none focus:ring-2 focus:ring-verdant/60"
                aria-haspopup="listbox"
                aria-expanded={categoryOpen}
                onClick={() => setCategoryOpen((o) => !o)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setCategoryOpen(false);
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCategoryOpen((o) => !o);
                  }
                }}
              >
                <span>
                  {categoryId
                    ? categories.find((c) => c.id === categoryId)?.name ||
                      "Choose category"
                    : "Choose category"}
                </span>
                <FiChevronDown
                  className={`${categoryOpen ? "rotate-180" : ""} transition`}
                />
              </button>

              {categoryOpen && (
                <div className="relative">
                  <div
                    className="absolute z-20 mt-2 w-full rounded-lg bg-mist text-ink shadow-xl ring-1 ring-ink/10"
                    role="listbox"
                  >
                    <span className="absolute -top-2 left-4 h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-mist" />
                    <ul className="max-h-72 overflow-auto py-2">
                      {categories.map((c) => {
                        const active = c.id === categoryId;
                        return (
                          <li key={c.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={active}
                              className={`block w-full text-left px-3 py-2 cursor-pointer rounded-md ${
                                active
                                  ? "bg-verdant/15 text-ink"
                                  : "hover:bg-verdant/10"
                              }`}
                              onClick={() => {
                                setCategoryId(c.id);
                                setCategoryOpen(false);
                              }}
                            >
                              {c.name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm">Image URL</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-mist/80 px-3 py-3 outline-none focus:ring-2 focus:ring-verdant/60"
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="mt-2 overflow-hidden rounded-lg ring-1 ring-ink/10 bg-ink/5">
                <img src={imageUrl} alt="Preview" className=" " />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push(`/products/${slug}`)}
              className="rounded-lg border border-ink/15 bg-mist px-4 py-2 hover:bg-mist/80 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-verdant px-4 py-2 text-mist hover:bg-verdant/90 cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
