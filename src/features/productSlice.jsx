import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedProduct: null,
  filteredProducts: [],
  products: [],
};

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