import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  selectedProduct: null,
  filteredProducts: [],
  products: [], // Add this to store the products from RTK Query
};

// Create the product slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    filterByCategory: (state, action) => {
      const category = action.payload;
      if (category === 'all') {
        state.filteredProducts = state.products;
        return;
      }
      state.filteredProducts = state.products.filter(
        product => product.category === category
      );
    },
  },
});

// Export actions and reducer
export const { 
  setSelectedProduct, 
  clearSelectedProduct,
  filterByCategory,
  setProducts
} = productSlice.actions;

export default productSlice.reducer;

// Selectors
export const selectSelectedProduct = (state) => state.products.selectedProduct;
export const selectFilteredProducts = (state) => state.products.filteredProducts || [];
export const selectAllProducts = (state) => state.products.products || []; 