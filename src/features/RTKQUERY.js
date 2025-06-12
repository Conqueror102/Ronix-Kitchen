// src/redux/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "https://ronixspicesbackend.onrender.com/api";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const authToken = getState().auth?.token;
      const adminToken = getState().admin?.adminData?.token;
      const token = authToken || adminToken;
      
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Category', 'Cart'],
  endpoints: (builder) => ({
    // ADMIN ROUTES
    loginAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/admin/login",
        method: "POST",
        body: credentials,
      }),
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

    // CART ROUTES
    getCart: builder.query({
      query: () => ({
        url: "/users/get-cart",
        method: "GET",
      }),
      providesTags: ['Cart'],
    }),

    // PRODUCT ROUTES
    getAllProducts: builder.query({
      query: () => 'users/all-product',
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

    createProduct: builder.mutation({
      query: (formData) => ({
        url: "/users/create-product",
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
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCartQuery,
} = apiSlice;
