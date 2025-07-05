import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetAllProductsQuery, useAddToCartMutation } from '../../features/RTKQUERY';
import { selectIsAuthenticated } from '../../features/authSlice';

function Menu() {
  const [activeCategory, setActiveCategory] = useState('all');
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data: productsData, isLoading, isError, error } = useGetAllProductsQuery();

  // State to track which product is currently being added to the cart.
  // This ensures the spinner and disabled state are specific to the clicked card.
  const [addingProductId, setAddingProductId] = useState(null); 
  const [addToCart] = useAddToCartMutation(); // Get the mutation function

  const [cartStatusMessage, setCartStatusMessage] = useState({ type: '', message: '' });

  // Ensure productsArray is always an array
  const productsArray = Array.isArray(productsData?.product) ? productsData.product : [];

  // Generate categories dynamically from product data, ensuring category.name is used if populated
  const categories = [
    { id: 'all', name: 'All' },
    ...Array.from(new Set(productsArray.map(p => p.category?.name || p.category))) // Use category.name if populated, else just the ID/string
      .filter(Boolean) // Filter out any null/undefined categories
      .map(cat => ({ id: cat, name: cat }))
  ];

  // Filter products based on active category
  const filteredProducts = activeCategory === 'all'
    ? productsArray
    : productsArray.filter(p => (p.category?.name || p.category) === activeCategory);

  // Effect to manage the automatic dismissal of status messages
  useEffect(() => {
    let timer;
    if (cartStatusMessage.message) {
      timer = setTimeout(() => {
        setCartStatusMessage({ type: '', message: '' });
      }, 3000); // Message disappears after 3 seconds
    }
    return () => clearTimeout(timer); // Cleanup timer on component unmount or message change
  }, [cartStatusMessage]);

  // Handler for adding a product to the cart
  const handleAddToCart = async (product) => {
    console.log("Menu - handleAddToCart: Attempting to add product to cart...");
    console.log("Menu - handleAddToCart: Is Authenticated:", isAuthenticated);

    if (!isAuthenticated) {
      setCartStatusMessage({ type: 'error', message: 'Please sign in to add items to your cart.' });
      console.log("Menu - handleAddToCart: Not authenticated, showing error message.");
      return;
    }

    setAddingProductId(product._id); // Set the ID of the product currently being added, to show spinner on this card only
    console.log("Menu - handleAddToCart: Product ID being sent:", product._id);
    console.log("Menu - handleAddToCart: Quantity being sent:", 1); // Assuming qty is always 1 for now

    try {
      // Execute the addToCart mutation with productId and quantity
      const response = await addToCart({ productId: product._id, qty: 1 }).unwrap();
      console.log("Menu - handleAddToCart: Add to cart successful! Response:", response);
      setCartStatusMessage({ type: 'success', message: `${product.productName} added to cart!` });
    } catch (err) {
      console.error('Menu - handleAddToCart: Add to cart failed! Error:', err);
      let msg = 'Failed to add item to cart. Please try again.';
      // Extract specific error message from the RTK Query error object
      if (err.data?.message) {
        msg = err.data.message;
      } else if (err.error) {
        msg = `Error: ${err.error}`;
      } else if (err.message) { // Fallback for generic JS errors not from RTK Query
        msg = err.message;
      }
      setCartStatusMessage({ type: 'error', message: msg });
    } finally {
      setAddingProductId(null); // Reset the adding product ID regardless of success or failure
      console.log("Menu - handleAddToCart: Add to cart process finished for product:", product._id);
    }
  };

  return (
    <div className="bg-softOrange min-h-screen flex flex-col font-inter">
      {/* Main menu content */}
      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Menu Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 rounded-full text-sm font-medium mb-3">
              Explore Our Offerings
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-black font-extrabold">
              Our <span className="bg-clip-text text-transparent bg-vibrantOrange">Menu</span>
            </h1>
            <div className="w-24 h-1 bg-vibrantOrange mx-auto mt-4"></div>
          </div>

          {/* Cart Status Message (fixed position for alerts) */}
          {cartStatusMessage.message && (
            <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl text-center transition-all duration-300 transform ${
              cartStatusMessage.type === 'success'
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}>
              {cartStatusMessage.message}
            </div>
          )}

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap justify-center mb-10 gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-vibrantOrange text-white shadow-md'
                    : 'bg-black text-white hover:bg-gray-700 hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Conditional Rendering based on API call status */}
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vibrantOrange"></div>
              <span className="ml-4 text-lg text-gray-500">Loading menu...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-60 text-red-600 text-center p-4 rounded-lg bg-red-100 border border-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-bold mb-2">Failed to Load Menu</p>
                <p className="text-sm">{error.data?.message || error.error || 'An unexpected error occurred.'}</p>
                <p className="text-xs text-gray-600 mt-2">Please check your network connection or try again later.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-gray-600 text-center p-4 rounded-lg bg-gray-100 border border-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
                </svg>
                <p className="font-bold mb-2">No Items Found</p>
                <p className="text-sm">There are no menu items matching the selected category or available products.</p>
            </div>
          ) : (
            /* Menu Items Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
              {filteredProducts.map((item) => {
                const isItemAdding = addingProductId === item._id; // Check if THIS item is being added
                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg flex flex-col sm:flex-row hover:shadow-xl transition duration-300"
                  >
                    {/* Item Image */}
                    <div className="sm:w-1/3 relative flex-shrink-0">
                      <img
                        src={item.image && item.image.length > 0 ? item.image[0] : 'https://placehold.co/400x200/F7F7F7/AAAAAA?text=No+Image'}
                        alt={item.productName || 'Product Image'}
                        className="w-full h-full object-cover object-center"
                        style={{ minHeight: '180px', maxHeight: '200px' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x200/F7F7F7/AAAAAA?text=Image+Error';
                        }}
                      />
                      {item.tags && item.tags.length > 0 && (
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <span
                              key={index}
                              className={`text-xs font-bold px-2 py-1 rounded-full ${
                                tag === 'Popular' ? 'bg-yellow-500 text-yellow-900' :
                                tag === 'Spicy' ? 'bg-red-600 text-white' :
                                tag === 'Vegetarian' ? 'bg-green-500 text-green-900' :
                                tag === 'Signature' ? 'bg-purple-500 text-white' :
                                'bg-blue-500 text-white'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-black mb-1">{item.productName || 'N/A'}</h3>
                        <p className="text-gray-400 text-sm mb-4">{item.description || 'No description available.'}</p>
                      </div>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-vibrantOrange font-bold">${item.price?.toFixed(2) || '0.00'}</span>
                        <button
                          className="bg-black text-white text-sm font-bold py-1.5 px-4 rounded-lg hover:bg-black/90 cursor-pointer transition flex items-center justify-center"
                          onClick={() => handleAddToCart(item)}
                          disabled={!isAuthenticated || isItemAdding}
                          title={!isAuthenticated ? 'Sign in to add items to your cart.' : isItemAdding ? 'Adding to cart...' : `Add ${item.productName} to order`}
                          aria-label={`Add ${item.productName} to order`}
                        >
                          {isItemAdding ? (
                            <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : null}
                          Add to Order
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Menu;