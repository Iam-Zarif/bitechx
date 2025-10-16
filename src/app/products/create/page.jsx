"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiChevronDown,
  FiLoader,
  FiPlus,
  FiTrash2,
  FiImage,
  FiTag,
  FiType,
  FiDollarSign,
  FiAlertCircle,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectToken,
  setSession as setTokenAction,
} from "@/store/sessionSlice";
import {
  useGetCategoriesQuery,
  useCreateProductMutation,
} from "@/store/productsApi";

export default function CreateProductPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);

  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [imageInput, setImageInput] = useState("");
  const [imgState, setImgState] = useState({});
  const [categoryId, setCategoryId] = useState("");

  const [status, setStatus] = useState("idle");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    const existing =
      typeof window !== "undefined"
        ? localStorage.getItem("bitechx_token") || ""
        : "";
    if (!token && existing) dispatch(setTokenAction(existing));
    if (!existing && !token) router.replace("/");
  }, [token, dispatch, router]);

  const { data: categories = [] } = useGetCategoriesQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    function onDocClick(e) {
      if (catRef.current && !catRef.current.contains(e.target))
        setCatOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const isValidUrl = (u) => {
    try {
      const test = new URL(u);
      return !!test.protocol && !!test.hostname;
    } catch {
      return false;
    }
  };

  const preload = (url) => {
    setImgState((s) => ({ ...s, [url]: "loading" }));
    const img = new Image();
    img.onload = () => setImgState((s) => ({ ...s, [url]: "loaded" }));
    img.onerror = () => setImgState((s) => ({ ...s, [url]: "error" }));
    img.src = url;
  };

  const addImage = () => {
    const v = imageInput.trim();
    if (!v) return;
    if (!isValidUrl(v)) {
      showTemp("error", "Image URL must be a valid link");
      return;
    }
    setImages((prev) => {
      const next = Array.from(new Set([...prev, v]));
      if (!prev.includes(v)) preload(v);
      return next;
    });
    setImageInput("");
  };

  const removeImage = (url) => {
    setImages((prev) => prev.filter((x) => x !== url));
    setImgState((s) => {
      const n = { ...s };
      delete n[url];
      return n;
    });
  };

  const validate = () => {
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!categoryId) return "Please choose a category";
    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0)
      return "Price must be a number greater than 0";
    if (images.length === 0) return "Please add at least 1 image URL";
    if (!images.every(isValidUrl)) return "All image URLs must be valid";
    return "";
  };

  const showTemp = (s, m) => {
    setStatus(s);
    setStatusMsg(m);
    setTimeout(() => {
      setStatus("idle");
      setStatusMsg("");
    }, 3500);
  };

  const [createProduct, { isLoading: busy }] = useCreateProductMutation();

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      showTemp("error", v);
      return;
    }
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        images,
        price: Number(price),
        categoryId,
      };
      const res = await createProduct(payload).unwrap();
      showTemp("success", "Product created");
      const slug = res?.slug || "";
      setTimeout(() => {
        if (slug) router.push(`/products/${slug}`);
        else router.push("/products");
      }, 500);
    } catch {
      showTemp("error", "Failed to create product");
    }
  };

  const selectedCategoryName = useMemo(
    () => (categoryId ? categories.find((c) => c.id === categoryId)?.name : ""),
    [categoryId, categories]
  );

  return (
    <main className="min-h-screen bg-mist text-ink p-6">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Product
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Provide details, images, price, and category.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl bg-mist ring-1 ring-ink/10 shadow">
          <form onSubmit={onSubmit} className="p-6 space-y-6">
            {status !== "idle" && (
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-3 text-sm ${
                  status === "success"
                    ? "bg-verdant/10 text-ink"
                    : "bg-rust/10 text-rust"
                }`}
              >
                {status === "success" ? <FiCheck /> : <FiAlertCircle />}
                <span>{statusMsg}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="mb-1 block text-sm">
                  Name
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-ink/60">
                    <FiType />
                  </span>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Red Hoodie"
                    className="w-full rounded-xl border border-ink/15 bg-mist/80 pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-verdant/60"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="price" className="mb-1 block text-sm">
                  Price
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-ink/60">
                    <FiDollarSign />
                  </span>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-ink/15 bg-mist/80 pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-verdant/60"
                  />
                </div>
              </div>

              <div ref={catRef} className="relative">
                <label className="mb-1 block text-sm">Category</label>
                <button
                  type="button"
                  onClick={() => setCatOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={catOpen}
                  className="inline-flex w-full items-center justify-between rounded-xl border border-ink/15 bg-mist/80 px-3 py-3 text-left outline-none focus:ring-2 focus:ring-verdant/60"
                >
                  <span className="inline-flex items-center gap-2">
                    <FiTag className="text-ink/60" />
                    {selectedCategoryName || "Select category"}
                  </span>
                  <FiChevronDown
                    className={`${catOpen ? "rotate-180" : ""} transition`}
                  />
                </button>
                {catOpen && (
                  <div className="absolute left-0 right-0 z-20 mt-2 rounded-xl bg-mist text-ink shadow-xl ring-1 ring-ink/10">
                    <span className="absolute -top-2 left-6 h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-mist" />
                    <ul role="listbox" className="max-h-72 overflow-auto py-2">
                      {categories.map((c) => {
                        const active = c.id === categoryId;
                        return (
                          <li key={c.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={active}
                              onClick={() => {
                                setCategoryId(c.id);
                                setCatOpen(false);
                              }}
                              className={`block w-full cursor-pointer rounded-md px-3 py-2 text-left ${
                                active ? "bg-verdant/15" : "hover:bg-verdant/10"
                              }`}
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

              <div className="sm:col-span-2">
                <label htmlFor="description" className="mb-1 block text-sm">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Write a short description…"
                  className="w-full rounded-xl border border-ink/15 bg-mist/80 px-3 py-3 outline-none focus:ring-2 focus:ring-verdant/60"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm">Images</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-ink/60">
                    <FiImage />
                  </span>
                  <input
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://…"
                    className="w-full rounded-xl border border-ink/15 bg-mist/80 pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-verdant/60"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addImage();
                      }
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text");
                      setTimeout(() => {
                        if (isValidUrl(pasted)) {
                          setImageInput(pasted);
                          addImage();
                        }
                      }, 0);
                    }}
                    onBlur={() => {
                      if (imageInput.trim()) addImage();
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={addImage}
                  className="inline-flex items-center gap-2 rounded-xl bg-verdant px-4 py-3 text-mist hover:bg-verdant/90"
                >
                  <FiPlus />
                  Add
                </button>
              </div>

              {images.length > 0 && (
                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {images.map((url) => {
                    const state = imgState[url] || "loading";
                    return (
                      <li
                        key={url}
                        className="overflow-hidden rounded-xl border border-ink/10 bg-mist/70"
                      >
                        <div className="relative aspect-[4/3] w-full bg-ink/5">
                          {state !== "error" && (
                            <img
                              src={url}
                              alt="Preview"
                              className={`h-full w-full object-cover transition-opacity ${
                                state === "loaded"
                                  ? "opacity-100"
                                  : "opacity-60"
                              }`}
                              onLoad={() =>
                                setImgState((s) => ({ ...s, [url]: "loaded" }))
                              }
                              onError={() =>
                                setImgState((s) => ({ ...s, [url]: "error" }))
                              }
                              loading="lazy"
                            />
                          )}
                          {state === "loading" && (
                            <div className="absolute inset-0 grid place-items-center text-ink/70">
                              <FiLoader className="h-5 w-5 animate-spin" />
                            </div>
                          )}
                          {state === "error" && (
                            <div className="absolute inset-0 grid place-items-center text-rust">
                              <FiAlertCircle className="h-6 w-6" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute right-2 top-2 rounded-lg bg-mist/90 p-2 text-ink/70 hover:bg-verdant/10"
                            aria-label="Remove image"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2 px-3 py-2">
                          <span className="line-clamp-1 text-xs text-ink/80">
                            {url}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] ${
                              state === "loaded"
                                ? "bg-verdant/15 text-ink"
                                : state === "loading"
                                ? "bg-ink/10 text-ink/70"
                                : "bg-rust/15 text-rust"
                            }`}
                          >
                            {state}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/products")}
                className="rounded-xl border border-ink/15 bg-mist px-4 py-3 hover:bg-mist/80"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-verdant px-5 py-3 text-mist hover:bg-verdant/90 disabled:opacity-60"
              >
                {busy ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-mist border-b-transparent" />
                ) : (
                  <FiPlus />
                )}
                {busy ? "Creating…" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
