import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  useGetProductsAdminQuery,
  useUpdateProductMutation,
  useDeleteProductsMutation,
  useGetAllCategoriesQuery
} from '../../../../features/RTKQUERY';

function ProductList() {

  const {
    data: productsData,
    isLoading: areProductsLoading,
    isError: productsFetchError,
    error: productsErrorDetails,
  } = useGetProductsAdminQuery();

  const {
    data: categoriesData,
    isLoading: areCategoriesLoading,
    isError: categoriesFetchError,
    error: categoriesErrorDetails,
  } = useGetAllCategoriesQuery();

  const [updateProduct, { isLoading: isUpdatingProduct, isSuccess: updateSuccess, isError: updateError, error: updateErrorData, reset: resetUpdateMutationState }] = useUpdateProductMutation();
  const [deleteBatchProducts, { isLoading: isDeletingProduct, isSuccess: deleteSuccess, isError: deleteError, error: deleteErrorData, reset: resetDeleteMutationState }] = useDeleteProductsMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const products = productsData?.product || [];

  const categories = (categoriesData?.categories || []).filter(cat => cat.active);
  console.log(categories)

  const isLoading = areProductsLoading || areCategoriesLoading || isUpdatingProduct || isDeletingProduct;

  const error = productsFetchError || categoriesFetchError ?
    (productsErrorDetails?.data?.message || categoriesErrorDetails?.data?.message || 'Failed to load data.') : null;

  const filteredProducts = products.filter(product => {
    const productName = product.productName ?? '';
    const productDescription = product.description ?? '';
    const productCategory = typeof product.category === 'object' && product.category !== null
                            ? (product.category.name ?? '')
                            : (product.category ?? '');

    const searchMatch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        productDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const categoryMatch = categoryFilter === 'all' ||
                          (typeof categoryFilter === 'string' && categoryFilter.toLowerCase() === productCategory.toLowerCase()) ||
                          (typeof categoryFilter === 'object' && categoryFilter?._id === product.category?._id);

    const stockMatch = stockFilter === 'all' ||
      (stockFilter === 'inStock' && product.inStock) ||
      (stockFilter === 'outOfStock' && !product.inStock);

    return searchMatch && categoryMatch && stockMatch;
  }).sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'name') {
      comparison = (a.productName || '').localeCompare(b.productName || '');
    } else if (sortBy === 'price') {
      comparison = (a.price || 0) - (b.price || 0);
    } else if (sortBy === 'rating') {
      comparison = (a.rating || 0) - (b.rating || 0);
    } else if (sortBy === 'sales') {
      comparison = (a.sales || 0) - (b.sales || 0);
    } else if (sortBy === 'dateAdded') {
      comparison = new Date(a.dateAdded || 0).getTime() - new Date(b.dateAdded || 0).getTime();
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  useEffect(() => {
    if (deleteSuccess) {
      setSuccessMessage(`Product deleted successfully!`);
      if (selectedProduct && deleteErrorData?.originalArgs?.[0] && selectedProduct._id === deleteErrorData.originalArgs[0]) {
          setSelectedProduct(null);
      }
      resetDeleteMutationState();
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
    if (deleteError) {
      console.error('Error deleting product:', deleteErrorData);
      let displayErrorMessage = 'Failed to delete product.';
      if (deleteErrorData) {
        if (typeof deleteErrorData.data === 'string' && deleteErrorData.data.startsWith('<!DOCTYPE html>')) {
          displayErrorMessage = `Server error during deletion (Status: ${deleteErrorData.originalStatus || 'Unknown'}). Check backend logs.`;
        } else if (deleteErrorData.data?.message) {
          displayErrorMessage = `Failed to delete: ${deleteErrorData.data.message}`;
        } else if (deleteErrorData.error) {
          displayErrorMessage = `Deletion error: ${deleteErrorData.error}`;
        }
      }
      setSuccessMessage(displayErrorMessage);
      resetDeleteMutationState();
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }

    if (updateSuccess) {
        setSuccessMessage('Product updated successfully!');
        resetUpdateMutationState();
        const timer = setTimeout(() => setSuccessMessage(''), 3000);
        return () => clearTimeout(timer);
    }
    if (updateError) {
        console.error('Error updating product:', updateErrorData);
        let displayErrorMessage = 'Failed to update product.';
        if (updateErrorData?.data?.message) {
            displayErrorMessage = `Failed to update: ${updateErrorData.data.message}`;
        } else if (updateErrorData.error) {
            displayErrorMessage = `Update error: ${updateErrorData.error}`;
        }
        setSuccessMessage(displayErrorMessage);
        resetUpdateMutationState();
        const timer = setTimeout(() => setSuccessMessage(''), 5000);
        return () => clearTimeout(timer);
    }

  }, [deleteSuccess, deleteError, deleteErrorData, resetDeleteMutationState, updateSuccess, updateError, updateErrorData, resetUpdateMutationState, selectedProduct]);


  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const viewProductDetails = (product) => {
    setSelectedProduct(product);
  };

  const handleToggleFeatured = async (productId, currentFeaturedStatus) => {
    try {
      await updateProduct({ id: productId, featured: !currentFeaturedStatus }).unwrap();
    } catch (err) {
      console.error('Error toggling featured status:', err);
    }
  };

  const handleToggleStock = async (productId, currentStockStatus) => {
    try {
      await updateProduct({ id: productId, inStock: !currentStockStatus }).unwrap();
    } catch (err) {
      console.error('Error toggling stock status:', err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteBatchProducts([productId]).unwrap();
    } catch (err) {
      console.error('Error initiating single product deletion:', err);
    }
  };

  const navigateToEdit = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  const navigateToAddProduct = () => {
    navigate('/admin/products/add-product');
  };

  const productStats = {
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    featured: products.filter(p => p.featured).length
  };

  return (
    <div className='flex flex-col space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className="bg-white/90 rounded-xl shadow-md overflow-hidden backdrop-blur-md">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-black mb-2">
                Product <span className="bg-clip-text text-transparent bg-gradient-to-r from-softOrange to-vibrantOrange">Catalog</span>
              </h2>
              <p className="text-gray-600 text-lg">
                View and manage your delicious menu items
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-softOrange via-vibrantOrange to-softOrange mt-4 rounded-full"></div>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full lg:w-72 bg-softOrange/20 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange transition duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-700 px-4 py-3 rounded-lg flex items-center border border-red-500/30 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className={`px-4 py-3 rounded-lg flex items-center shadow-sm ${deleteSuccess || updateSuccess ? 'bg-green-500/10 border border-green-500 text-green-700' : 'bg-red-500/10 border border-red-500 text-red-700'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={(deleteSuccess || updateSuccess) ? "M5 13l4 4L19 7" : "M10 14l2-2m0 0l2-2m-2 2L10 6m2 6l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/90 p-5 rounded-xl shadow-md flex items-center justify-between backdrop-blur-md">
          <div>
            <h4 className="text-gray-600 text-sm font-medium">Total Products</h4>
            <p className="text-3xl font-bold text-black mt-1">{productStats.total}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-vibrantOrange opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m7 0V5a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" />
          </svg>
        </div>
        <div className="bg-white/90 p-5 rounded-xl shadow-md flex items-center justify-between backdrop-blur-md">
          <div>
            <h4 className="text-gray-600 text-sm font-medium">In Stock</h4>
            <p className="text-3xl font-bold text-green-600 mt-1">{productStats.inStock}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="bg-white/90 p-5 rounded-xl shadow-md flex items-center justify-between backdrop-blur-md">
          <div>
            <h4 className="text-gray-600 text-sm font-medium">Out of Stock</h4>
            <p className="text-3xl font-bold text-red-600 mt-1">{productStats.outOfStock}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2L10 6m2 6l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <button
          onClick={navigateToAddProduct}
          className="bg-gradient-to-r from-vibrantOrange to-softOrange hover:from-softOrange hover:to-vibrantOrange text-white font-bold py-5 px-6 rounded-xl shadow-lg flex items-center justify-center transition duration-300 transform hover:scale-105 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-xl">Add New Product</span>
        </button>
      </div>

      <div className="bg-white/90 p-6 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 backdrop-blur-md">
        <div>
          <label htmlFor="categoryFilter" className="block text-gray-700 text-sm font-bold mb-2">Category</label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-softOrange/40"
          >
            <option value="all">All Categories</option>
            {areCategoriesLoading ? (
              <option disabled>Loading categories...</option>
            ) : categories.length > 0 ? (
              categories.map(cat => (
                <option key={cat._id || cat.id} value={cat.name?.toLowerCase()}>{cat.name}</option>
              ))
            ) : (
              <option disabled>No categories available</option>
            )}
          </select>
        </div>
        <div>
          <label htmlFor="stockFilter" className="block text-gray-700 text-sm font-bold mb-2">Stock Status</label>
          <select
            id="stockFilter"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-softOrange/40"
          >
            <option value="all">All Stock</option>
            <option value="inStock">In Stock</option>
            <option value="outOfStock">Out of Stock</option>
          </select>
        </div>
        <div className="flex items-end space-x-2">
          <div className="flex-grow">
            <label htmlFor="sortBy" className="block text-gray-700 text-sm font-bold mb-2">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-softOrange/40"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              {/* <option value="rating">Rating</option> */}
              <option value="sales">Sales</option>
              <option value="dateAdded">Date Added</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-vibrantOrange hover:bg-softOrange text-white p-2 rounded-lg transition duration-300"
            aria-label={`Sort order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortOrder === 'asc' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 8h12m-6 4v4m0 0l-2-2m2 2l2-2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 20h18M6 16h12m-6-4v-4m0 0l-2 2m2-2l2 2" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedProduct ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-300`}>
          <div className="bg-white/90 rounded-xl shadow-md overflow-hidden backdrop-blur-md">
            <div className="px-6 py-4 border-b border-softOrange/40 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">Product List</h3>
              <div className="flex items-center">
                <button
                  onClick={navigateToAddProduct}
                  className="px-4 py-1.5 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition duration-300 text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Product
                </button>
              </div>
            </div>
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-vibrantOrange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-vibrantOrange">Loading products...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-softOrange/40">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Price</th>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Rating</th> */}
                        <th className="px-16 py-3 text-left text-xs font-medium text-black uppercase  tracking-wide">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-softOrange/40">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                          <tr key={product._id} className={index % 2 === 0 ? 'bg-softOrange/10' : 'bg-white/60'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-12 w-12 flex-shrink-0 rounded-md overflow-hidden">
                                  <img className="h-12 w-12 object-cover"
                                       src={product.image && product.image.length > 0 ? product.image[0] : 'https://placehold.co/48x48/F7F7F7/AAAAAA?text=NoImg'}
                                       alt={product.productName || 'Product Image'} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-black">{product.productName}</div>
                                  <div className="text-sm text-gray-600 truncate max-w-xs">{product.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-softOrange/40 text-black capitalize">
                                {product.category?.name || 'N/A'} 
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                              {formatCurrency(product.price)}
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap"> */}
                              {/* <div className="flex items-center"> */}
                                {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-vibrantOrange" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg> */}
                                {/* <span className="ml-1 text-sm text-black">{product.rating?.toFixed(1) || "0.0"}</span> */}
                              {/* </div> */}
                            {/* </td> */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.inStock ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                                {product.featured && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-600">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                              <button
                                onClick={() => viewProductDetails(product)}
                                className="text-vibrantOrange hover:text-orange-600 transition duration-150 mr-3"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleToggleFeatured(product._id, product.featured)}
                                className={`${product.featured ? 'text-yellow-600 hover:text-yellow-500' : 'text-gray-400 hover:text-vibrantOrange'} transition duration-150 mr-3`}
                                title={product.featured ? 'Remove from featured' : 'Add to featured'}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-500 hover:text-red-600 transition duration-150"
                                title="Delete product"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg">No products found</p>
                            <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-softOrange/10 border-t border-softOrange/40">
                  <p className="text-sm text-gray-600">
                    Showing {filteredProducts.length} of {products.length} products
                    {categoryFilter !== 'all' ? ` in ${categoryFilter}` : ''}
                    {stockFilter !== 'all' ? ` (${stockFilter === 'inStock' ? 'in stock' : 'out of stock'})` : ''}
                    {searchTerm ? ` matching "${searchTerm}"` : ''}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {selectedProduct && (
          <div className="lg:col-span-1 transition-all duration-300">
            <div className="bg-white/90 rounded-xl shadow-md overflow-hidden sticky top-6 backdrop-blur-md">
              <div className="px-6 py-4 border-b border-softOrange/40 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-black">Product Details</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-600 hover:text-black transition duration-150"
                  title="Close details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div>
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={selectedProduct.image && selectedProduct.image.length > 0 ? selectedProduct.image[0] : 'https://placehold.co/400x225/F7F7F7/AAAAAA?text=NoImg'}
                    alt={selectedProduct.productName || 'Product Image'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {selectedProduct.featured && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/80 text-white">
                        Featured
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedProduct.inStock ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                      {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-xl font-semibold text-black">{selectedProduct.productName}</h4>
                    <div className="flex items-center mt-1">
                      <span className="text-lg font-bold text-vibrantOrange mr-2">
                        {formatCurrency(selectedProduct.price)}
                      </span>
                      <span className="text-sm px-2 py-0.5 bg-softOrange/40 text-black rounded-full capitalize">
                        {selectedProduct.category?.name || 'N/A'} {/* Access category.name */}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-softOrange/40">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-vibrantOrange" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {/* <span className="ml-1 text-sm text-black">{selectedProduct.rating?.toFixed(1) || "0.0"}</span> */}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {selectedProduct.sales || 0} sold
                    </div>
                    <div className="text-gray-600 text-sm">
                      Added: {formatDate(selectedProduct.dateAdded)}
                    </div>
                  </div>

                  <div className="py-3 border-b border-softOrange/40">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">DESCRIPTION</h5>
                    <p className="text-gray-700 text-sm">{selectedProduct.description}</p>
                  </div>

                  {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                    <div className="py-3 border-b border-softOrange/40">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">INGREDIENTS</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.ingredients.map((ingredient, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-softOrange/40 text-black rounded-full">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => handleToggleStock(selectedProduct._id, selectedProduct.inStock)}
                      className={`flex-1 px-4 py-2 ${selectedProduct.inStock ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20' : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'} font-medium rounded-lg transition duration-300 flex items-center justify-center`}
                      disabled={isUpdatingProduct}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {selectedProduct.inStock ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      {selectedProduct.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                    </button>

                    <button
                      onClick={() => handleToggleFeatured(selectedProduct._id, selectedProduct.featured)}
                      className={`flex-1 px-4 py-2 ${selectedProduct.featured ? 'bg-softOrange/60 hover:bg-softOrange text-black' : 'bg-gradient-to-r from-softOrange via-vibrantOrange to-softOrange hover:from-vibrantOrange hover:to-softOrange text-white'} font-medium rounded-lg transition duration-300 flex items-center justify-center`}
                      disabled={isUpdatingProduct}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                      </svg>
                      {selectedProduct.featured ? 'Remove Featured' : 'Mark as Featured'}
                    </button>
                  </div>

                  <div className="flex space-x-3 mt-3">
                    <button
                      onClick={() => navigateToEdit(selectedProduct._id)}
                      className="flex-1 px-4 py-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 font-medium rounded-lg transition duration-300 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Product
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(selectedProduct._id)}
                      className="px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 font-medium rounded-lg transition duration-300 flex items-center justify-center"
                      disabled={isDeletingProduct}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;