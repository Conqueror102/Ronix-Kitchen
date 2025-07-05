import React, { useState, useEffect } from 'react';
import { useGetProductsAdminQuery, useDeleteProductsMutation, useGetAllCategoriesQuery } from '../../../../features/RTKQUERY';

function RemoveProduct() {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // This will now hold category _id or 'all'
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' }); // Unified status message

  // RTK Query hook for fetching products
  const {
    data: productsData,
    isLoading: areProductsLoading,
    isError: productsFetchError,
    error: productsErrorDetails,
    refetch: refetchProducts
  } = useGetProductsAdminQuery();

  // RTK Query hook for fetching categories
  const {
    data: categoriesData,
    isLoading: areCategoriesLoading,
    isError: categoriesFetchError,
    error: categoriesErrorDetails,
    refetch: refetchCategories
  } = useGetAllCategoriesQuery(); // Correct hook for getting all categories

  // RTK Query mutation for deleting products
  const [deleteProducts, {
    isLoading: isDeleting,
    isSuccess: deleteSuccess,
    isError: deleteError,
    error: deleteErrorData,
    reset: resetDeleteMutationState
  }] = useDeleteProductsMutation();

  // Extract products array from response, default to empty array
  const products = productsData?.product || [];
  // Extract categories array from response, filter for active ones
  const categories = (categoriesData?.categories || []).filter(cat => cat.active);

  // Consolidated loading and error states
  const isLoading = areProductsLoading || areCategoriesLoading || isDeleting;
  const mainError = productsFetchError || categoriesFetchError ?
    (productsErrorDetails?.data?.message || categoriesErrorDetails?.data?.message || 'Failed to load initial data.') : null;

  useEffect(() => {
    let timer;
    if (deleteSuccess) {
      setStatusMessage({ type: 'success', message: `Successfully deleted ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}.` });
      setSelectedProducts([]); // Clear selection after successful deletion
      resetDeleteMutationState(); // Reset RTK Query mutation state
      timer = setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
    } else if (deleteError) {
      console.error('Error deleting products:', deleteErrorData);
      let displayErrorMessage = 'Failed to delete product(s).';
      if (deleteErrorData) {
        if (typeof deleteErrorData.data === 'string' && deleteErrorData.data.startsWith('<!DOCTYPE html>')) {
          displayErrorMessage = `Server error during deletion (Status: ${deleteErrorData.originalStatus || 'Unknown'}). Please check backend logs.`;
        } else if (deleteErrorData.data?.message) {
          displayErrorMessage = `Failed to delete: ${deleteErrorData.data.message}`;
        } else if (deleteErrorData.error) {
          displayErrorMessage = `Deletion error: ${deleteErrorData.error}`;
        }
      }
      setStatusMessage({ type: 'error', message: displayErrorMessage }); // Display the error message
      resetDeleteMutationState(); // Reset RTK Query mutation state
      timer = setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000);
    }
    return () => clearTimeout(timer);
  }, [deleteSuccess, deleteError, selectedProducts.length, deleteErrorData, resetDeleteMutationState]);


  const filteredProducts = products.filter(product => {
    const productName = product.productName ?? '';
    const productDescription = product.description ?? '';
    // Access category name for search if populated, otherwise assume it's the ID string
    const productCategoryName = typeof product.category === 'object' && product.category !== null
                                ? (product.category.name ?? '')
                                : (product.category ?? '');
    // Access category ID for filtering if populated, otherwise assume it's the ID string
    const productCategoryId = typeof product.category === 'object' && product.category !== null
                                ? (product.category._id ?? '')
                                : (product.category ?? ''); // This would be the ID if not populated

    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          productDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          productCategoryName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || productCategoryId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Handle individual product checkbox selection
  const handleProductSelection = (productId) => {
    setSelectedProducts(prevSelected => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter(id => id !== productId); // Deselect if already selected
      } else {
        return [...prevSelected, productId]; // Select if not already selected
      }
    });
  };

  // Handle "Select All" checkbox
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product._id)); // Use product._id
    }
  };

  // Show the confirmation modal for deletion
  const confirmDelete = () => {
    setShowConfirmation(true);
  };

  // Hide the confirmation modal
  const cancelDelete = () => {
    setShowConfirmation(false);
  };

  // Function to delete selected products (calls the RTK Query mutation)
  const deleteSelectedProducts = async () => {
    if (selectedProducts.length === 0) return;

    try {
      await deleteProducts(selectedProducts).unwrap();
    } catch (error) {
      // Errors handled by useEffect
      console.error("Failed to initiate batch delete operation:", error);
    } finally {
      setShowConfirmation(false); // Close the confirmation modal regardless
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className='flex flex-col space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Header Section */}
      <div className="bg-white/90 rounded-xl shadow-md overflow-hidden backdrop-blur-md">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-black mb-2">
                Remove <span className="bg-clip-text text-transparent bg-gradient-to-r from-softOrange to-vibrantOrange">Products</span>
              </h2>
              <p className="text-gray-600 text-lg">
                Delete products from your menu permanently.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-softOrange via-vibrantOrange to-softOrange mt-4 rounded-full"></div>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
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
                  className="pl-10 pr-4 py-2 w-full lg:w-64 bg-softOrange/40 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange transition duration-200"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-softOrange/40 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange"
                disabled={areCategoriesLoading}
              >
                <option value="all">All Categories</option>
                {areCategoriesLoading ? (
                  <option disabled>Loading categories...</option>
                ) : categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option> // Value is _id, display name
                  ))
                ) : (
                  <option disabled>No categories available</option>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Message Display */}
      {statusMessage.message && (
        <div className={`px-4 py-3 rounded-lg flex items-center shadow-sm ${statusMessage.type === 'success' ? 'bg-green-500/10 border border-green-500 text-green-600' : 'bg-red-500/10 border border-red-500 text-red-600'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusMessage.type === 'success' ? "M5 13l4 4L19 7" : "M10 14l2-2m0 0l2-2m-2 2L10 6m2 6l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} />
          </svg>
          <span>{statusMessage.message}</span>
        </div>
      )}

      {/* Main Content Area: Product Table */}
      <div className="bg-white/90 rounded-xl shadow-md overflow-hidden backdrop-blur-md">
        <div className="px-6 py-4 border-b border-softOrange/40 flex justify-between items-center">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-black">Select Products to Remove</h3>
            {selectedProducts.length > 0 && (
              <span className="ml-3 text-sm text-vibrantOrange font-medium">
                {selectedProducts.length} selected
              </span>
            )}
          </div>
          {selectedProducts.length > 0 && (
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 font-medium rounded-lg transition duration-300 flex items-center"
              disabled={isDeleting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected
            </button>
          )}
        </div>

        {/* Loading, Error, or Product List Content */}
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
        ) : mainError ? (
          <div className="p-8 text-center text-red-600">
            <h2 className="text-2xl font-bold mb-4">Error Loading Products</h2>
            <p className="text-gray-600">Failed to fetch products. Please try again later.</p>
            <p className="text-sm text-gray-500">Error: {mainError}</p>
            <button onClick={() => {refetchProducts(); refetchCategories();}} className="mt-4 px-4 py-2 bg-vibrantOrange text-white rounded-lg hover:bg-softOrange transition-colors">
              Try Again
            </button>
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-softOrange/40">
                    <tr>
                      <th className="px-4 py-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-vibrantOrange bg-softOrange border-softOrange rounded focus:ring-0 focus:ring-offset-0"
                            checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                            onChange={handleSelectAll}
                          />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-softOrange/40">
                    {filteredProducts.map((product, index) => (
                      <tr
                        key={product._id}
                        className={`${index % 2 === 0 ? 'bg-softOrange/10' : 'bg-white/60'} ${selectedProducts.includes(product._id) ? 'bg-vibrantOrange/10' : ''} hover:bg-softOrange/20 transition-colors`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-vibrantOrange bg-softOrange border-softOrange rounded focus:ring-0 focus:ring-offset-0"
                              checked={selectedProducts.includes(product._id)}
                              onChange={() => handleProductSelection(product._id)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap" onClick={() => handleProductSelection(product._id)}>
                          <div className="flex items-center cursor-pointer">
                            <div className="h-12 w-12 flex-shrink-0 rounded-md overflow-hidden">
                              <img className="h-12 w-12 object-cover"
                                src={product.image && product.image.length > 0 ? product.image[0] : 'https://placehold.co/48x48/F7F7F7/AAAAAA?text=NoImg'}
                                alt={product.productName || 'Product Image'}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-black">{product.productName}</div>
                              <div className="text-sm text-gray-600 truncate max-w-sm">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-softOrange/40 text-black capitalize">
                            {product.category?.name || 'N/A'} {/* FIX: Access .name property */}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-vibrantOrange mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-vibrantOrange text-lg">No products found</p>
                <p className="text-gray-600 text-sm mt-1">Try adjusting your search term or filter</p>
              </div>
            )}
          </>
        )}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="px-6 py-4 bg-softOrange/10 border-t border-softOrange/40">
            <p className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
              {categoryFilter !== 'all' ? ` in ${categories.find(cat => cat._id === categoryFilter)?.name || 'selected category'}` : ''}
              {searchTerm ? ` matching "${searchTerm}"` : ''}
            </p>
          </div>
        )}
      </div>

      {/* Warning about permanence */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="ml-3">
          <h4 className="text-yellow-500 font-medium">Important Note</h4>
          <p className="text-gray-600 text-sm mt-1">
            Deleting products is permanent and cannot be undone. Deleted products will be removed from your menu,
            but may still appear in past orders and sales reports.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white/90 rounded-xl shadow-lg max-w-md w-full relative overflow-hidden">
            <div className="p-6 border-b border-softOrange/40">
              <h3 className="text-xl font-bold text-black">Confirm Deletion</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start text-red-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <div>
                  <p className="text-black font-medium">
                    Are you sure you want to delete {selectedProducts.length} {selectedProducts.length === 1 ? 'product' : 'products'}?
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    This action cannot be undone. The products will be permanently removed from your menu.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-softOrange/40 hover:bg-softOrange text-black font-medium rounded-lg transition duration-300"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={deleteSelectedProducts}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition duration-300 flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete {selectedProducts.length} {selectedProducts.length === 1 ? 'Product' : 'Products'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RemoveProduct;
