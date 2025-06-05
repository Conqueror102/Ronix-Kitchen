import React, { useState, useEffect } from 'react';
// import productsService from '../../../../firebase/ProductsService';

function RemoveProduct() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // Replace with your API call
        // const productsData = await fetch('/api/products').then(res => res.json());
        // setProducts(productsData);
        // Demo data:
        setProducts([
          {
            id: 1,
            name: "Classic Ramen",
            description: "Delicious ramen with pork broth.",
            image: "/images/ramen1.jpg",
            category: "ramen",
            price: 12.99,
            inStock: true,
            featured: true
          }
        ]);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle checkbox selection
  const handleProductSelection = (productId) => {
    setSelectedProducts(prevSelected => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter(id => id !== productId);
      } else {
        return [...prevSelected, productId];
      }
    });
  };

  // Select all displayed products
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id));
    }
  };

  // Confirm deletion
  const confirmDelete = () => {
    setShowConfirmation(true);
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowConfirmation(false);
  };

  // Delete selected products
  const deleteSelectedProducts = async () => {
    if (selectedProducts.length === 0) return;
    setIsDeleting(true);
    try {
      // Replace with your API call
      // await fetch('/api/products/delete', { method: 'POST', body: JSON.stringify({ ids: selectedProducts }) });
      setProducts(products.filter(product => !selectedProducts.includes(product.id)));
      setSelectedProducts([]);
      setSuccessMessage(`Successfully deleted ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting products:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  return (
    <div className='flex flex-col space-y-6 max-w-6xl mx-auto'>
      {/* Header */}
      <div className="bg-white/90 rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">
                Remove <span className="bg-clip-text text-transparent bg-vibrantOrange">Products</span>
              </h2>
              <p className="text-gray-600">
                Delete products from your menu
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-softOrange via-vibrantOrange to-softOrange mt-4"></div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
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
                  className="pl-10 pr-4 py-2 w-full lg:w-64 bg-softOrange/40 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-softOrange/40 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange"
              >
                <option value="all">All Categories</option>
                <option value="ramen">Ramen</option>
                <option value="sushi">Sushi</option>
                <option value="appetizers">Appetizers</option>
                <option value="desserts">Desserts</option>
                <option value="drinks">Drinks</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500 text-green-600 px-4 py-3 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main content */}
      <div className="bg-white/90 rounded-xl shadow-md overflow-hidden">
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
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected
            </button>
          )}
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
                        key={product.id} 
                        className={`${index % 2 === 0 ? 'bg-softOrange/10' : 'bg-white/60'} ${selectedProducts.includes(product.id) ? 'bg-vibrantOrange/10' : ''} hover:bg-softOrange/20 transition-colors`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-vibrantOrange bg-softOrange border-softOrange rounded focus:ring-0 focus:ring-offset-0"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleProductSelection(product.id)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap" onClick={() => handleProductSelection(product.id)}>
                          <div className="flex items-center cursor-pointer">
                            <div className="h-12 w-12 flex-shrink-0 rounded-md overflow-hidden">
                              <img className="h-12 w-12 object-cover" src={product.image} alt={product.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-black">{product.name}</div>
                              <div className="text-sm text-gray-600 truncate max-w-sm">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-softOrange/40 text-black capitalize">
                            {product.category}
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
              {categoryFilter !== 'all' ? ` in ${categoryFilter}` : ''}
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
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