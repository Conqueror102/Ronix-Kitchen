// src/redux/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "https://ronixspicesbackend.onrender.com/api";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Category'],
  endpoints: (builder) => ({
    // PRODUCT ROUTES
    getAllProducts: builder.query({
      query: () => '/users/products',
      providesTags: ['Product']
    }),

    getProductById: builder.query({
      query: (id) => `/users/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }]
    }),

    getProductsByCategory: builder.query({
      query: (category) => `/users/getByCategory?category=${category}`,
      providesTags: ['Product']
    }),

    // USER ROUTES
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
    }),

    signUpUser: builder.mutation({
      query: (newUser) => ({
        url: "/users/signUp",
        method: "POST",
        body: newUser,
      }),
    }),

    addToCart: builder.mutation({
      query: ({ productId, qty }) => ({
        url: "/users/addToCart",
        method: "POST",
        body: { productId, qty },
      }),
    }),

    removeFromCart: builder.mutation({
      query: ({ productId }) => ({
        url: "/users/removeFromCart",
        method: "DELETE",
        body: { productId },
      }),
    }),

    createOrder: builder.mutation({
      query: () => ({
        url: "/users/createOrder",
        method: "POST",
      }),
    }),

    // ADMIN ROUTES
    loginAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/admin/login",
        method: "POST",
        body: credentials,
      }),
    }),

    signUpAdmin: builder.mutation({
      query: (newAdmin) => ({
        url: "/admin/signUp",
        method: "POST",
        body: newAdmin,
      }),
    }),

    createProduct: builder.mutation({
      query: (formData) => ({
        url: "/admin/createProduct",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Product']
    }),

    updateProduct: builder.mutation({
      query: (data) => ({
        url: "/admin/updateProduct",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }]
    }),

    deleteProduct: builder.mutation({
      query: ({ id }) => ({
        url: "/admin/deleteProduct",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ['Product']
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
  useLoginUserMutation,
  useSignUpUserMutation,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useCreateOrderMutation,
  useLoginAdminMutation,
  useSignUpAdminMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = apiSlice;
