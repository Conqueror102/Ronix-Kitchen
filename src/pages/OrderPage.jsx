import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; // No useDispatch needed if no local slice actions are used
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'; // Keep AnimatePresence for status messages

// Import necessary RTK Query hooks
import {
  useGetProductsByCategoryQuery,
  useGetCartQuery,        // To fetch the current cart from backend
  useAddToCartMutation,   // To add items to backend cart
  useRemoveFromCartMutation, // To remove items from backend cart
  useUpdateCartItemMutation, // To update quantity in backend cart
  useCreateOrderMutation, // To send the order to the backend
  useGetAllCategoriesQuery, // To fetch categories dynamically
} from '../features/RTKQUERY';

import { selectIsAuthenticated } from '../features/authSlice'; // Assuming authSlice manages authentication state

export default function OrderPage() {
  const navigate = useNavigate();
  // const dispatch = useDispatch(); // Not directly used for products/categories here anymore.
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector((state) => state.auth?.userData); // Access user data from auth slice

  // Fetch all products for the menu display
  const { data: allProductsData, isLoading: productsLoading, isError: productsError, error: productFetchError } = useGetProductsByCategoryQuery('all');
  const productsArray = Array.isArray(allProductsData?.product) ? allProductsData.product : [];

  // Fetch categories dynamically
  const { data: fetchedCategories = [], isLoading: categoriesLoading } = useGetAllCategoriesQuery();

  // RTK Query for cart
  const { data: cartData, isLoading: cartLoading, error: cartError, refetch: refetchCart } = useGetCartQuery(undefined, {
    skip: !isAuthenticated, // Only fetch cart if authenticated
  });

  // RTK Query Mutations for cart and order
  const [addToCartMutation, { isLoading: isAddingToCart, error: addToCartError }] = useAddToCartMutation();
  const [updateCartItemMutation, { isLoading: isUpdatingCartItem }] = useUpdateCartItemMutation();
  const [removeFromCartMutation, { isLoading: isRemovingFromCart }] = useRemoveFromCartMutation();
  const [createOrderMutation, { isLoading: isCreatingOrder, isSuccess: orderSuccess, isError: orderError, error: orderErrorDetails }] = useCreateOrderMutation();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [spiceLevelFilter, setSpiceLevelFilter] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' }); // For general feedback

  const cartItems = cartData?.cart?.items || []; // Ensure cartItems is always an array

  // Populate categories once fetched
  const categories = [{ id: 'all', name: 'All Items' }].concat(
    (Array.isArray(fetchedCategories.allCategories) ? fetchedCategories.allCategories : [])
      .map(cat => ({ id: cat.name, name: cat.name })) // Assuming fetchedCategories is an array of objects with 'name'
      .filter((cat, index, self) => self.findIndex(c => c.id === cat.id) === index) // Ensure unique categories
  );

  // Filter menu items based on selected category, search query, and spice level
  const filteredMenu = productsArray.filter(item => {
    const matchesCategory = selectedCategory === 'all' ||
                            (item.category && (item.category.name === selectedCategory || item.category === selectedCategory)); // Handle both populated and unpopulated category
    const matchesSearch = (item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))));
    const matchesSpiceLevel = spiceLevelFilter === null || item.spiceLevel === spiceLevelFilter;

    return matchesCategory && matchesSearch && matchesSpiceLevel;
  });

  // Effect for status messages
  useEffect(() => {
    let timer;
    if (statusMessage.message) {
      timer = setTimeout(() => {
        setStatusMessage({ type: '', message: '' });
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [statusMessage]);

  // Handle adding product to backend cart
  // Now simpler, only takes product and quantity
  const handleAddToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      setStatusMessage({ type: 'error', message: 'Please sign in to add items to your cart.' });
      return;
    }

    try {
      const response = await addToCartMutation({ productId: product._id, qty: quantity }).unwrap();
      setStatusMessage({ type: 'success', message: `${product.productName} added to cart!` });
      refetchCart(); // Immediately refetch cart to show updated items
      console.log('Add to cart response:', response);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      let msg = 'Failed to add item to cart. Please try again.';
      if (err.data?.message) msg = err.data.message;
      else if (err.error) msg = `Error: ${err.error}`;
      setStatusMessage({ type: 'error', message: msg });
    }
  };

  // Handle updating quantity in backend cart
  const handleUpdateCartItemQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItemMutation({ productId, qty: newQuantity }).unwrap();
      setStatusMessage({ type: 'success', message: 'Cart item quantity updated!' });
      refetchCart();
    } catch (err) {
      console.error('Failed to update cart item quantity:', err);
      let msg = 'Failed to update quantity. Please try again.';
      if (err.data?.message) msg = err.data.message;
      else if (err.error) msg = `Error: ${err.error}`;
      setStatusMessage({ type: 'error', message: msg });
    }
  };

  // Handle removing item from backend cart
  const handleRemoveFromCart = async (productId) => {
    try {
      await removeFromCartMutation({ productId }).unwrap();
      setStatusMessage({ type: 'success', message: 'Item removed from cart!' });
      refetchCart();
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      let msg = 'Failed to remove item. Please try again.';
      if (err.data?.message) msg = err.data.message;
      else if (err.error) msg = `Error: ${err.error}`;
      setStatusMessage({ type: 'error', message: msg });
    }
  };

  // Calculates total for a single item from the cartItems array (fetched from backend)
  const calculateItemTotal = (item) => {
    // Assuming item.product is populated and has a price, and item.qty exists
    const basePrice = item.product?.price || 0;
    return basePrice * item.qty;
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setStatusMessage({ type: 'error', message: 'Your cart is empty!' });
      return;
    }

    if (!isAuthenticated || !user?._id) { // Check for authentication and user ID
      setStatusMessage({ type: 'error', message: 'Please sign in to place an order.' });
      navigate('/auth/signin', { state: { returnUrl: '/order' } });
      return;
    }

    try {
      // Call the createOrder mutation
      // Your createOrder mutation on the backend currently does not expect a body.
      // It assumes the order will be created from the user's existing cart.
      const orderResponse = await createOrderMutation().unwrap();
      setStatusMessage({ type: 'success', message: 'Order placed successfully!' });
      console.log('Order created successfully:', orderResponse);

      // WhatsApp message preparation
      const adminPhoneNumber = '+2348012345678'; // !!! REPLACE WITH YOUR ADMIN'S WHATSAPP NUMBER !!!
      const orderSummary = cartItems.map(item => {
        // Access product details from item.product (assuming it's populated)
        return `${item.qty}x ${item.product?.productName || 'Unknown Item'} - $${calculateItemTotal(item).toFixed(2)}`;
      }).join('\n');

      const whatsappMessage = encodeURIComponent(
        `*New Order!* (User: ${user.username || user.email || 'N/A'})\n\n` +
        `Order Details:\n${orderSummary}\n\n` +
        `Total: *$${cartTotal.toFixed(2)}*\n\n` +
        `Please check the admin dashboard for full details.` +
        (orderResponse?.orderId ? ` Order ID: ${orderResponse.orderId}` : '') // Include order ID if backend provides it
      );
      const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${whatsappMessage}`;
      window.open(whatsappUrl, '_blank'); // Open WhatsApp in a new tab

      // After order creation and WhatsApp message, clear frontend cart (backend will be cleared by createOrder)
      // and navigate to a success page.
      refetchCart(); // Refetch to ensure empty cart is displayed
      navigate('/order-success', { state: { orderId: orderResponse?.orderId } }); // Pass orderId if you have it
    } catch (err) {
      console.error('Failed to create order:', err);
      let msg = 'Failed to place order. Please try again.';
      if (orderErrorDetails?.data?.message) msg = orderErrorDetails.data.message;
      else if (orderErrorDetails?.error) msg = `Error: ${orderErrorDetails.error}`;
      setStatusMessage({ type: 'error', message: msg });
    }
  };

  // Styles for scrollbar hiding
  const hideScrollbarStyle = {
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE 10+
  };

  const webkitScrollbarStyle = `
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;

  // Render loading state for menu products
  if (productsLoading || categoriesLoading || cartLoading) { // Also wait for cart to load
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        <span className="ml-4 text-lg">Loading menu and cart...</span>
      </div>
    );
  }

  // Render error state for menu products
  if (productsError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-4 rounded-lg bg-red-800/20 border border-red-800 text-red-300">
          <h2 className="text-2xl font-bold mb-4">Error Loading Menu</h2>
          <p>{productFetchError?.data?.message || productFetchError?.error || 'An unexpected error occurred while fetching menu items.'}</p>
        </div>
      </div>
    );
  }

  // Handle empty menu after loading
  if (productsArray.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">No Products Available</h2>
        <p className="text-gray-400">Please add products to the database.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <style>{webkitScrollbarStyle}</style>

      {/* Global Status Message */}
      <AnimatePresence>
        {statusMessage.message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl text-center ${
              statusMessage.type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
            } text-white`}
          >
            {statusMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen">
        {/* Left Side - Menu Navigation and Items */}
        <div
          className="w-full md:w-3/4 h-screen overflow-y-auto hide-scrollbar"
          style={hideScrollbarStyle}
        >
          {/* Title and Filter Bar */}
          <div className="sticky top-0 bg-gray-900 z-10 p-4 pb-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Order Online</h1>
                <p className="text-gray-400">Order delicious food for pickup or delivery</p>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  to="/cart" // Navigate to your dedicated CartPage
                  className="relative bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors"
                  aria-label="View Cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cartItems.reduce((sum, item) => sum + item.qty, 0)} {/* Use item.qty from backend cart */}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search our menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <select
                value={spiceLevelFilter === null ? 'all' : spiceLevelFilter}
                onChange={(e) => setSpiceLevelFilter(e.target.value === 'all' ? null : Number(e.target.value))}
                className="pl-3 pr-10 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="all">Spice Level</option>
                <option value="0">No Spice</option>
                <option value="1">Mild</option>
                <option value="2">Medium</option>
                <option value="3">Spicy</option>
                <option value="4">Extra Spicy</option>
              </select>
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar py-3 -mx-4 px-4 mt-3 space-x-2" style={hideScrollbarStyle}>
              {categoriesLoading ? (
                // Show loading indicators while categories are being fetched
                <>
                  <div className="px-4 py-2 bg-gray-800 rounded-full animate-pulse w-20 h-8"></div>
                  <div className="px-4 py-2 bg-gray-800 rounded-full animate-pulse w-24 h-8"></div>
                  <div className="px-4 py-2 bg-gray-800 rounded-full animate-pulse w-20 h-8"></div>
                </>
              ) : categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-yellow-500 to-red-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items List */}
          <div className="p-4">
            {filteredMenu.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredMenu.map((menuItem) => (
                  <div // Removed React.Fragment and conditional rendering for expandedItemId
                    key={menuItem._id} // Use _id from backend products
                    className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transition-all"
                  >
                    {/* Basic Item Info */}
                    <div className="flex">
                      <div className="w-1/3 aspect-square overflow-hidden flex-shrink-0">
                        <img
                          src={menuItem.image && menuItem.image.length > 0 ? menuItem.image[0] : `https://placehold.co/600x400/333333/AAAAAA?text=No+Image`}
                          alt={menuItem.productName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x400/333333/AAAAAA?text=Image+Error`; }}
                        />
                        {menuItem.tags && menuItem.tags.length > 0 && (
                          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            {menuItem.tags.map((tag, index) => (
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

                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-lg font-bold text-white">{menuItem.productName}</h3>
                              {menuItem.featured && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-900/40 text-yellow-500 rounded-full">
                                  Featured ⭐
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{menuItem.description}</p>
                          </div>
                          <span className="text-yellow-500 font-bold">${menuItem.price?.toFixed(2) || '0.00'}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {menuItem.spiceLevel > 0 && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              menuItem.spiceLevel === 1 ? 'bg-yellow-900/40 text-yellow-500' :
                              menuItem.spiceLevel === 2 ? 'bg-orange-900/40 text-orange-500' :
                              menuItem.spiceLevel === 3 ? 'bg-red-900/40 text-red-500' :
                              'bg-red-900/40 text-red-400'
                            }`}>
                              {menuItem.spiceLevel === 1 && 'Mild'}
                              {menuItem.spiceLevel === 2 && 'Medium'}
                              {menuItem.spiceLevel === 3 && 'Spicy'}
                              {menuItem.spiceLevel >= 4 && 'Very Spicy'}
                              {' '}{Array(menuItem.spiceLevel).fill('🌶️').join('')}
                            </span>
                          )}

                          {menuItem.category && (
                            <span className="px-2 py-1 text-xs bg-gray-700/80 rounded-full text-gray-300">
                              {menuItem.category.name || menuItem.category} {/* Handle populated/unpopulated category */}
                            </span>
                          )}

                          {menuItem.tags && menuItem.tags.slice(0, 1).map((tag) => (
                            <span key={tag} className="px-2 py-1 text-xs bg-gray-700 rounded-full text-gray-300">
                              {tag}
                            </span>
                          ))}

                          {menuItem.rating > 0 && (
                            <span className="px-2 py-1 text-xs bg-blue-900/40 text-blue-400 rounded-full flex items-center">
                              <span className="mr-1">★</span>{menuItem.rating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-end mt-4"> {/* Align button to the right */}
                          <button
                            onClick={() => handleAddToCart(menuItem, 1)} // Always add with quantity 1
                            disabled={!menuItem.inStock || isAddingToCart}
                            className={`px-4 py-2 ${
                              menuItem.inStock
                                ? 'bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600'
                                : 'bg-gray-600 cursor-not-allowed'
                            } text-white rounded-md transition-colors flex items-center justify-center`}
                          >
                            {isAddingToCart ? (
                              <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : null}
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-300 mb-2">No items found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSpiceLevelFilter(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Cart (Always visible on larger screens) */}
        <div
          className="hidden md:block w-1/4 h-screen bg-gray-800 border-l border-gray-700"
        >
          <div className="h-full flex flex-col">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Your Order</h2>
            </div>

            {/* Cart Items */}
            <div
              className="flex-1 overflow-y-auto p-4 hide-scrollbar"
              style={hideScrollbarStyle}
            >
              {cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.map((item, index) => {
                    if (!item.product) {
                      console.warn("Cart item has no populated product data:", item);
                      return null; // Don't render if product data is missing
                    }
                    return (
                      <div key={item.product._id} className="bg-gray-700 rounded-lg p-3 flex gap-3 relative">
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.image && item.product.image.length > 0 ? item.product.image[0] : 'https://placehold.co/96x96/333333/AAAAAA?text=No+Image'}
                            alt={item.product.productName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/96x96/333333/AAAAAA?text=Image+Error`; }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">{item.product.productName}</h3>
                          <p className="text-gray-400 text-sm">{item.product.description}</p>
                          {/* Quantity controls for items in the cart */}
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUpdateCartItemQuantity(item.product._id, item.qty - 1)}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white bg-gray-600 rounded"
                                disabled={item.qty <= 1 || isUpdatingCartItem}
                              >
                                -
                              </button>
                              <span className="w-6 text-center">{item.qty}</span>
                              <button
                                onClick={() => handleUpdateCartItemQuantity(item.product._id, item.qty + 1)}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white bg-gray-600 rounded"
                                disabled={isUpdatingCartItem}
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm text-yellow-500">${calculateItemTotal(item).toFixed(2)}</span>
                            <button
                              onClick={() => handleRemoveFromCart(item.product._id)}
                              className="text-red-500 hover:text-red-600 text-sm ml-2"
                              disabled={isRemovingFromCart}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                  <h3 className="text-xl font-medium text-gray-300 mb-2">Your cart is empty</h3>
                  <p className="text-gray-400 mb-6">Start adding items to your cart</p>
                  <button
                    onClick={() => navigate('/')} 
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Go to Menu
                  </button>
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || isCreatingOrder}
                className="w-full bg-gradient-to-r from-yellow-500 to-red-500 text-white py-3 rounded-md transition-colors hover:from-yellow-600 hover:to-red-600 flex items-center justify-center"
              >
                {isCreatingOrder ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  cartItems.length === 0 ? 'Cart is empty' : `Proceed to Checkout ($${cartTotal.toFixed(2)})`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
