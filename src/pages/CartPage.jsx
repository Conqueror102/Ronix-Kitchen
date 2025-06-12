import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCartQuery,  useRemoveFromCartMutation } from '../features/RTKQUERY';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/authSlice';

const CartPage = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { data: cartData, isLoading, error } = useGetCartQuery(undefined, {
        skip: !isAuthenticated
    });
    // const [updateCartItem] = useUpdateCartItemMutation();
    const [removeFromCart] = useRemoveFromCartMutation();

    // Redirect to login if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth/signin', { state: { from: '/cart' } });
        }
    }, [isAuthenticated, navigate]);

    const handleQuantityChange = async (itemId, newQty) => {
        try {
            await updateCartItem({ itemId, qty: newQty }).unwrap();
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await removeFromCart(itemId).unwrap();
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-softOrange flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vibrantOrange"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-softOrange flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Cart</h2>
                    <p className="text-gray-600">Please try again later</p>
                </div>
            </div>
        );
    }

    if (!cartData?.cart?.items?.length) {
        return (
            <div className="min-h-screen bg-softOrange flex items-center justify-center">
                <div className="text-center">
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

    const subtotal = cartData.cart.items.reduce((total, item) => {
        return total + (item.product.price * item.qty);
    }, 0);

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return (
        <div className="min-h-screen bg-softOrange py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {cartData.cart.items.map((item) => (
                                <div key={item._id} className="p-6 border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-center">
                                        <div className="h-24 w-24 flex-shrink-0">
                                            <img
                                                src={item.product.image[0]}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover rounded-lg"
                                            />
                                        </div>
                                        <div className="ml-6 flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {item.product.name}
                                                </h3>
                                                <p className="text-lg font-medium text-vibrantOrange">
                                                    ${(item.product.price * item.qty).toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => handleQuantityChange(item._id, Math.max(1, item.qty - 1))}
                                                        className="p-1 rounded-full hover:bg-gray-100"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                    <span className="mx-4 text-gray-600">{item.qty}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item._id, item.qty + 1)}
                                                        className="p-1 rounded-full hover:bg-gray-100"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(item._id)}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax (10%)</span>
                                    <span className="text-gray-900">${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-medium text-gray-900">Total</span>
                                        <span className="text-lg font-medium text-vibrantOrange">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full mt-6 bg-vibrantOrange text-white py-3 px-4 rounded-lg hover:bg-vibrantOrange/90 transition-colors"
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