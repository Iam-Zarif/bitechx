"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import {
  FiChevronLeft,
  FiTrash2,
  FiEdit2,
  FiAlertTriangle,
  FiX,
  FiLoader,
} from "react-icons/fi";
import { Api } from "../../../../Api";
import useTitle from "@/hooks/useTitle";


export default function ProductDetailsPage() {
  const router = useRouter();
  const { id: slug } = useParams(); // we treat [id] as slug
  useTitle(` ${slug} `);
  const [token, setToken] = useState("");
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("bitechx_token") || "";
    if (!t) {
      router.replace("/login");
      return;
    }
    setToken(t);
  }, [router]);

  const ax = useMemo(() => {
    const instance = axios.create({
      baseURL: Api,
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
          localStorage.removeItem("bitechx_token");
          router.replace("/login");
        }
        return Promise.reject(e);
      }
    );
    return instance;
  }, [token, router]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!token || !slug) return;
      setIsLoading(true);
      setErrorMessage("");
      try {
        const { data } = await ax.get(`/products/${slug}`);
        if (!mounted) return;
        setProduct(data);
      } catch {
        if (!mounted) return;
        setErrorMessage("Failed to load product.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [ax, token, slug]);

  const handleDelete = async () => {
    if (!product?.id) return;
    setIsDeleting(true);
    try {
      await ax.delete(`/products/${product.id}`);
      router.replace("/products");
    } catch {
      setErrorMessage("Failed to delete product. Please try again.");
    } finally {
      setIsDeleting(false);
      setConfirmDelete({ open: false, id: null, name: "" });
    }
  };

  return (
    <main className="min-h-screen bg-mist  text-ink p-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/products")}
            className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-mist px-3 py-2 hover:bg-mist/80 cursor-pointer"
          >
            <FiChevronLeft />
            Back
          </button>

          {product && (
            <div className="flex items-center gap-3">
              <Link
                href={`/products/${slug}/edit`}
                className="inline-flex items-center gap-2 rounded-lg bg-verdant px-3 py-2 text-mist hover:bg-verdant/90 cursor-pointer"
                title="Edit product"
              >
                <FiEdit2 />
                Edit
              </Link>
              <button
                onClick={() =>
                  setConfirmDelete({
                    open: true,
                    id: product.id,
                    name: product.name,
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-rust px-3 py-2 text-mist hover:bg-rust/90 cursor-pointer"
                title="Delete product"
              >
                <FiTrash2 />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <section className="rounded-2xl bg-mist p-4 ring-1 ring-ink/10">
          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-16 text-ink/70">
              <FiLoader className="h-5 w-5 animate-spin" />
              <span>Loading product…</span>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-rust/10 px-3 py-3 text-rust">
              <FiAlertTriangle />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isLoading && product && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Image */}
              <div className="overflow-hidden rounded-xl bg-ink/5 ring-1 ring-ink/10">
                <img
                  src={
                    product.images?.[0] ||
                    "https://via.placeholder.com/800x600?text=No+Image"
                  }
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold">{product.name}</h1>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-verdant/10 px-3 py-1 text-sm">
                    {product?.category?.name || "Uncategorized"}
                  </span>
                  <span className="text-verdant font-semibold text-lg">
                    ${product.price}
                  </span>
                </div>

                <p className="text-ink/70 leading-relaxed">
                  {product.description || "No description provided."}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-mist/70 p-3 ring-1 ring-ink/10">
                    <div className="text-ink/60">Slug</div>
                    <div className="font-medium">{product.slug}</div>
                  </div>
                  <div className="rounded-lg bg-mist/70 p-3 ring-1 ring-ink/10">
                    <div className="text-ink/60">ID</div>
                    <div className="font-mono text-sm">{product.id}</div>
                  </div>
                  <div className="rounded-lg bg-mist/70 p-3 ring-1 ring-ink/10">
                    <div className="text-ink/60">Created</div>
                    <div className="font-medium">
                      {new Date(product.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg bg-mist/70 p-3 ring-1 ring-ink/10">
                    <div className="text-ink/60">Updated</div>
                    <div className="font-medium">
                      {new Date(product.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Delete confirmation modal */}
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
                disabled={isDeleting}
                className="rounded-lg bg-rust px-4 py-2 text-mist hover:bg-rust/90 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
