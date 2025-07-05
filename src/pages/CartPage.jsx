import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCartQuery, useRemoveFromCartMutation, useUpdateCartItemMutation } from '../features/RTKQUERY';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/authSlice';

const CartPage = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Fetch cart data, skip if not authenticated
    const { data: cartData, isLoading, error, refetch } = useGetCartQuery(undefined, {
        skip: !isAuthenticated,
    });

    useEffect(() => {
        if (cartData) {
            console.log("CartPage - Cart Data Received:", cartData);
        }
        if (error) {
            console.error("CartPage - Cart Fetch Error:", error);
        }
    }, [cartData, error]);
    // --- END DEBUGGING STEP ---

    const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
    const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();

    const [processingItemId, setProcessingItemId] = useState(null);
    const [cartStatusMessage, setCartStatusMessage] = useState({ type: '', message: '' });


    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth/signin', { state: { from: '/cart' } });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        let timer;
        if (cartStatusMessage.message) {
            timer = setTimeout(() => {
                setCartStatusMessage({ type: '', message: '' });
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [cartStatusMessage]);


    const handleQuantityChange = async (productId, newQty) => {
        // Prevent decreasing below 1
        newQty = Math.max(1, newQty);
        setProcessingItemId(productId); // Set item being processed

        try {
            await updateCartItem({ productId, qty: newQty }).unwrap();
            setCartStatusMessage({ type: 'success', message: 'Cart item quantity updated!' });
        } catch (error) {
            console.error('CartPage - Failed to update quantity:', error);
            let msg = 'Failed to update quantity. Please try again.';
            if (error?.data?.message) {
                msg = error.data.message;
            } else if (error?.error) {
                msg = `Error: ${error.error}`;
            }
            setCartStatusMessage({ type: 'error', message: msg });
        } finally {
            setProcessingItemId(null);
        }
    };

    const handleRemoveItem = async (productId) => {
        setProcessingItemId(productId);

        try {
            await removeFromCart({ productId }).unwrap();
            setCartStatusMessage({ type: 'success', message: 'Item removed from cart!' });
        } catch (error) {
            console.error('CartPage - Failed to remove item:', error);
            let msg = 'Failed to remove item. Please try again.';
            if (error?.data?.message) {
                msg = error.data.message;
            } else if (error?.error) {
                msg = `Error: ${error.error}`;
            }
            setCartStatusMessage({ type: 'error', message: msg });
        } finally {
            setProcessingItemId(null);
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-softOrange flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vibrantOrange"></div>
                <span className="ml-4 text-lg text-gray-500">Loading your cart...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-softOrange flex items-center justify-center">
                <div className="text-center p-4 rounded-lg bg-red-100 border border-red-500 text-red-600">
                    <h2 className="text-2xl font-bold mb-4">Error Loading Cart</h2>
                    <p className="text-gray-600 mb-2">Failed to fetch cart data. Please try again later.</p>
                    <p className="text-sm text-gray-500">Error: {error.data?.message || error.error || JSON.stringify(error)}</p>
                    <button
                        onClick={refetch}
                        className="mt-4 px-4 py-2 bg-vibrantOrange text-white rounded-lg hover:bg-softOrange transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }


    const cartItems = cartData?.cart?.items || [];

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-softOrange flex items-center justify-center">
                <div className="text-center p-4 rounded-lg bg-white shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
                    <button
                        onClick={() => navigate('/menu')}
                        className="px-6 py-3 bg-vibrantOrange text-white rounded-lg hover:bg-vibrantOrange/90 transition-colors"
                    >
                        Browse Menu
                    </button>
                </div>
            </div>
        );
    }

    const subtotal = cartItems.reduce((total, item) => {
        // Defensive check: Ensure item.product exists before accessing its properties
        if (!item.product || typeof item.product.price === 'undefined' || typeof item.qty === 'undefined') {
            console.warn("CartPage - Skipping item in subtotal calculation due to missing product data:", item);
            return total;
        }
        return total + (item.product.price * item.qty);
    }, 0);

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return (
        <div className="min-h-screen bg-softOrange py-12 px-4 sm:px-6 lg:px-8 font-inter">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-black mb-8 text-center sm:text-left">
                    Your <span className="bg-clip-text text-transparent bg-vibrantOrange">Order</span>
                </h1>

                {cartStatusMessage.message && (
                    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl text-center transition-all duration-300 transform ${
                        cartStatusMessage.type === 'success'
                            ? 'bg-green-500/90 text-white'
                            : 'bg-red-500/90 text-white'
                    }`}>
                        {cartStatusMessage.message}
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-xl overflow-hidden divide-y divide-gray-200">
                            {cartItems.map((item) => {
                                if (!item.product) {
                                    console.warn("CartPage - Skipping rendering for a cart item due to missing product data:", item);
                                    return null;
                                }
                                const isThisItemProcessing = processingItemId === item.product._id; 
                                return (
                                <div key={item.product._id} className="p-6">
                                    <div className="flex flex-col sm:flex-row items-center">
                                        <div className="h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={item.product.image && item.product.image.length > 0 ? item.product.image[0] : 'https://placehold.co/96x96/F7F7F7/AAAAAA?text=No+Image'}
                                                alt={item.product.productName || 'Product Image'}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                  e.target.onerror = null;
                                                  e.target.src = 'https://placehold.co/96x96/F7F7F7/AAAAAA?text=Image+Error';
                                                }}
                                            />
                                        </div>
                                        <div className="ml-0 sm:ml-6 mt-4 sm:mt-0 flex-1 w-full">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                                    {item.product.productName}
                                                </h3>
                                                <p className="text-lg font-bold text-vibrantOrange mt-2 sm:mt-0">
                                                    ${(item.product.price * item.qty).toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4 truncate max-w-sm">
                                                {item.product.description || 'No description available.'}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.product._id, item.qty - 1)}
                                                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                                        disabled={isThisItemProcessing || item.qty <= 1} // Disable if this item is processing or qty is 1
                                                        aria-label={`Decrease quantity of ${item.product.productName}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                    <span className="px-3 py-1 text-md font-medium text-gray-800 border rounded-md">{item.qty}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.product._id, item.qty + 1)}
                                                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                                        disabled={isThisItemProcessing} // Disable if this item is processing
                                                        aria-label={`Increase quantity of ${item.product.productName}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(item.product._id)}
                                                    className="text-red-500 hover:text-red-600 transition-colors duration-200 mt-4 sm:mt-0 px-3 py-1 rounded-md text-sm font-medium flex items-center"
                                                    disabled={isThisItemProcessing} // Disable if this item is processing
                                                >
                                                    {isThisItemProcessing ? ( // Show spinner ONLY if this item is being removed
                                                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : null}
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-xl p-6 sticky top-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                            <div className="space-y-4 text-lg">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax (10%)</span>
                                    <span className="text-gray-900 font-medium">${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="flex justify-between">
                                        <span className="text-xl font-bold text-gray-900">Total</span>
                                        <span className="text-xl font-bold text-vibrantOrange">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full mt-6 bg-vibrantOrange text-white py-3 px-4 rounded-lg hover:bg-vibrantOrange/90 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-md"
                                    disabled={cartItems.length === 0 || processingItemId !== null} // Disable if cart is empty or any item is processing
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;