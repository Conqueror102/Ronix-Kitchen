// src/redux/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from './authSlice';
import { adminLogout } from './adminSlice';

const baseUrl = "https://ronixspicesbackend.onrender.com/api";

// Create a custom base query with error handling
const baseQuery = fetchBaseQuery({
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
});

// Create a wrapper for the base query that handles token expiration
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 Unauthorized response, the token has expired
  if (result.error && result.error.status === 401) {
    // Get the current state
    const state = api.getState();
    
    // Check if it's an admin or user token that expired
    if (state.auth?.token) {
      // Logout user
      api.dispatch(logout());
    } else if (state.admin?.adminData?.token) {
      // Logout admin
      api.dispatch(adminLogout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const authToken = getState().auth?.token; // User token
      const adminToken = getState().admin?.adminData?.token; // Admin token
      const token = authToken || adminToken; // Prioritize admin token if both exist, or use user token

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // Define tag types for cache invalidation
  tagTypes: ["Product", "Category", "Cart", "Order", "User"], // Ensure all relevant tags are here
  endpoints: (builder) => ({
    // --- ADMIN AUTH ROUTES ---
    loginAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/admin/login",
        method: "POST",
        body: credentials,
      }),
    }),
    signUpAdmin: builder.mutation({
      query: (newUser) => ({
        url: "/admin/signUp",
        method: "POST",
        body: newUser,
      }),
    }),

    // --- USER AUTH ROUTES ---
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

    // --- CART ROUTES ---
    getCart: builder.query({
      query: () => ({
        url: "/users/get-cart",
        method: "GET",
      }),
      providesTags: ["Cart"], // This query provides data tagged as "Cart"
    }),

    addToCart: builder.mutation({
      query: ({ productId, qty }) => ({
        url: "/users/addToCart",
        method: "POST",
        body: { productId, qty },
      }),
      invalidatesTags: ["Cart"], 
    }),

    updateCartItem: builder.mutation({
      query: ({ productId, qty }) => ({
        url: "/users/updateCart",
        method: "PATCH",
        body: { productId, qty },
      }),
      invalidatesTags: ["Cart"], 
    }),

    removeFromCart: builder.mutation({
      query: ({ productId }) => ({
        url: "/users/removeFromCart",
        method: "DELETE",
        body: { productId },
      }),
      invalidatesTags: ["Cart"],   
    }),

    createOrder: builder.mutation({
      query: () => ({
        url: "/users/createOrder",
        method: "POST",
      }),
      invalidatesTags: ["Cart", "Order"],
    }),

    getAllProducts: builder.query({
      query: () => "users/get-all-products",
      providesTags: ["Product"],
    }),

    getProductById: builder.query({
      query: (id) => `/users/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    getProductsByCategory: builder.query({
      query: (category) => `/users/getByCategory?category=${category}`,
      providesTags: (result, error, category) => [
        { type: "Product", id: category },
      ],
    }),

    createProduct: builder.mutation({
      query: (formData) => ({
        url: "/admin/createProduct",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),

    getProductsAdmin: builder.query({
      query: () => "/admin/getAllProducts",
      providesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/admin/updateProduct/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Product",
        { type: "Product", id },
      ],
    }),

    deleteProducts: builder.mutation({
      query: (idsArray) => ({
        url: "/admin/deleteProducts",
        method: "DELETE",
        body: { ids: idsArray },
      }),
      invalidatesTags: ["Product"],
    }),

    getProductsByCategoryAdmin: builder.query({
      query: (categoryName) => `/admin/getByCategory?category=${categoryName}`,
      providesTags: ["Product"],
    }),

    createCategory: builder.mutation({
      query: (newCategoryData) => ({
        url: "/admin/categories",
        method: "POST",
        body: newCategoryData,
      }),
      invalidatesTags: ["Category"],
    }),

    getAllCategories: builder.query({
      query: () => "/admin/categories",
      providesTags: ["Category"],
    }),
    
    getCategories: builder.query({ 
      query: () => "/admin/categories",
      providesTags: ["Category"],
    }),

    getCategoryById: builder.query({
      query: (id) => `/admin/categories/${id}`,
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/admin/categories/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Category",
        { type: "Category", id },
      ],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    getAllOrdersAdmin: builder.query({
      query: () => "/admin/getAllOrders",
      providesTags: ["Order"],
    }),

    updateOrder: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/admin/updateOrders/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Order",
        { type: "Order", id },
      ],
    }),

    getAllUsersAdmin: builder.query({
      query: () => "/admin/getAllUsers",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginAdminMutation,
  useSignUpAdminMutation,
  useLoginUserMutation,
  useSignUpUserMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useCreateOrderMutation,
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
  useCreateProductMutation,
  useGetProductsAdminQuery,
  useUpdateProductMutation,
  useDeleteProductsMutation,
  useGetProductsByCategoryAdminQuery,
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetAllOrdersAdminQuery,
  useUpdateOrderMutation,
  useUpdateCategoryMutation,
  useGetAllUsersAdminQuery,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} = apiSlice;
