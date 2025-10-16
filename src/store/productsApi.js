"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = "https://api.bitechx.com";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      const token =
        (typeof window !== "undefined" &&
          localStorage.getItem("bitechx_token")) ||
        null;
      headers.set("Content-Type", "application/json");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
    timeout: 15000,
  }),
  tagTypes: ["Products", "Product", "Categories"],
  endpoints: (builder) => ({
    authLogin: builder.mutation({
      query: (body) => ({ url: "/auth", method: "POST", body }),
    }),

    getCategories: builder.query({
      query: () => ({ url: "/categories" }),
      providesTags: ["Categories"],
    }),

    getProducts: builder.query({
      query: ({ offset, limit, categoryId }) => ({
        url: "/products",
        params: {
          offset,
          limit,
          ...(categoryId && categoryId !== "all" ? { categoryId } : {}),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: "Product", id: p.id })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),

    searchProducts: builder.query({
      query: ({ searchedText }) => ({
        url: "/products/search",
        params: { searchedText },
      }),
      transformResponse: (arr, _meta, arg) => {
        if (arg.categoryId && arg.categoryId !== "all") {
          return (arr || []).filter((p) => p?.category?.id === arg.categoryId);
        }
        return arr || [];
      },
      providesTags: [{ type: "Products", id: "LIST" }],
    }),

    getProductBySlug: builder.query({
      query: (slug) => ({ url: `/products/${slug}` }),
      providesTags: (_r, _e, slug) => [{ type: "Product", id: slug }],
    }),

    createProduct: builder.mutation({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [{ type: "Products", id: "LIST" }, "Categories"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, patch }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Product", id: arg.id },
        { type: "Products", id: "LIST" },
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
  }),
});

export const {
  useAuthLoginMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useSearchProductsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
