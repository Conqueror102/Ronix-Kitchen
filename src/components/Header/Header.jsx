import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../features/useAuth';
import { selectIsAuthenticated, selectCurrentUser } from '../../features/authSlice';
import { useGetCartQuery } from '../../features/RTKQUERY';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const profileDropdownRef = useRef(null);
    const cartDropdownRef = useRef(null);
    
    // Auth state
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectCurrentUser);
    const { logout } = useAuth();
    
    // Get cart data from backend
    const { data: cartData, isLoading: isCartLoading } = useGetCartQuery(undefined, {
        skip: !isAuthenticated || !isCartOpen
    });

    // Calculate total quantity from cart items
    const totalQuantity = cartData?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const navItems = [
        {
            name: 'Home',
            slug: '/home',
            active: true
        },
        {
            name: 'Menu',
            slug: '/menu',
            active: true
        },
        {
            name: 'Services',
            slug: '/services',
            active: true
        },
        {
            name: 'Location',
            slug: '/location',
            active: true
        },
        {
            name: 'About',
            slug: '/about',
            active: true
        },
    ]
    
    const isActiveRoute = (path) => {
        return location.pathname === path;
    }
    
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
                setIsCartOpen(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileDropdownRef, cartDropdownRef]);

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
    };

    const handleProfileClick = () => {
        navigate('/user-profile');
        setIsProfileOpen(false);
    };

    return (
        <header className='sticky top-0 z-50 shadow-md backdrop-blur-md bg-white'>
            <div className='text-white py-4 px-6 sm:px-10'>
                <div className="flex flex-col md:flex-row md:items-center">
                    {/* Top Row - Logo and Action Buttons */}
                    <div className="flex justify-between items-center w-full">
                        {/* Logo */}
                        <Link to='/home' className="flex items-center">
                            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-vibrantOrange">Ronix Kitchen</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:block flex-grow mx-10">
                            <ul className="flex text-black font-semibold items-center justify-center space-x-1 lg:space-x-7">
                                {navItems.map(item => 
                                    item.active ? (
                                        <li key={item.name}>
                                            <button 
                                                onClick={() => navigate(item.slug)}
                                                className={`text-center inline-block px-2 py-2 duration-300 rounded-sm
                                                    ${isActiveRoute(item.slug) 
                                                        ? 'border-b-4 border-black text-vibrantOrange font-medium' 
                                                        : 'hover:text-vibrantOrange'
                                                    }`}
                                            >
                                                {item.name}
                                            </button>
                                        </li>
                                    ): null
                                )}
                            </ul>
                        </nav>

                        {/* Action Buttons Group */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Cart Button */}
                            <div className="relative" ref={cartDropdownRef}>
                                <button 
                                    onClick={() => navigate("/cart")}
                                    className="flex items-center space-x-1 py-2 px-3 bg-black hover:bg-black/95 text-gray-300 hover:text-white rounded-lg transition-colors focus:outline-none relative"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span>Cart</span>
                                    {totalQuantity > 0 && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-red-500 text-white text-xs font-bold ml-1">
                                            {totalQuantity}
                                        </span>
                                    )}
                                </button>
                                
                                {/* Cart Dropdown */}
                                {isCartOpen && (
                                    <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-700">
                                        <div className="px-4 py-2 border-b border-gray-700">
                                            <h3 className="text-sm font-medium text-white">Your Cart</h3>
                                            {totalQuantity > 0 && (
                                                <p className="text-xs text-gray-400 mt-1">{totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}</p>
                                            )}
                                        </div>
                                        {isCartLoading ? (
                                            <div className="px-4 py-6 text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                                                <p className="text-sm text-gray-400 mt-2">Loading cart...</p>
                                            </div>
                                        ) : cartData?.items?.length > 0 ? (
                                            <>
                                                <div className="max-h-60 overflow-y-auto">
                                                    {cartData.items.map((item, index) => (
                                                        <div key={index} className="px-4 py-2 border-b border-gray-700 flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden">
                                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                            </div>
                                                            <div className="ml-3 flex-1">
                                                                <p className="text-sm font-medium text-white">{item.name}</p>
                                                                <div className="flex justify-between items-center mt-1">
                                                                    <p className="text-xs text-gray-400">{item.quantity} × {formatCurrency(item.price)}</p>
                                                                    <p className="text-xs font-medium text-yellow-400">{formatCurrency(item.price * item.quantity)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <div className="px-4 py-2 border-b border-gray-700">
                                                    <div className="flex justify-between">
                                                        <p className="text-sm text-gray-300">Subtotal</p>
                                                        <p className="text-sm font-medium text-white">{formatCurrency(cartData.totalPrice)}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="px-4 py-3">
                                                    <button 
                                                        onClick={() => { navigate('/cart'); setIsCartOpen(false); }}
                                                        className="w-full bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-300"
                                                    >
                                                        View Cart
                                                    </button>
                                                    <button 
                                                        onClick={() => { navigate('/checkout'); setIsCartOpen(false); }}
                                                        className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-300"
                                                    >
                                                        Checkout
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="px-4 py-6 text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <p className="text-sm text-gray-400">Your cart is empty</p>
                                                <button 
                                                    onClick={() => { navigate('/menu'); setIsCartOpen(false); }}
                                                    className="mt-3 text-xs text-yellow-400 hover:text-yellow-300 font-medium transition duration-300"
                                                >
                                                    Browse our menu →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Profile/Auth Button */}
                            <div className="relative" ref={profileDropdownRef}>
                                {isAuthenticated ? (
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center space-x-2 py-2 px-3 bg-black hover:bg-black/95 text-gray-300 hover:text-white rounded-lg transition-colors focus:outline-none"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-vibrantOrange flex items-center justify-center text-white font-bold">
                                            {user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <span>{user?.name || 'User'}</span>
                                    </button>
                                ) : (
                                    <Link
                                        to="/auth/signin"
                                        className="flex items-center space-x-2 py-2 px-3 bg-vibrantOrange hover:bg-vibrantOrange/95 text-white hover:text-white rounded-lg transition-colors focus:outline-none"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Sign In</span>
                                    </Link>
                                )}

                                {/* Profile Dropdown */}
                                {isProfileOpen && isAuthenticated && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-700">
                                        <button
                                            onClick={handleProfileClick}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                        >
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => { navigate('/your-orders'); setIsProfileOpen(false); }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                        >
                                            Your Orders
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <nav className="md:hidden mt-4">
                            <ul className="flex flex-col space-y-2">
                                {navItems.map(item => 
                                    item.active ? (
                                        <li key={item.name}>
                                            <button 
                                                onClick={() => { navigate(item.slug); setIsMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-2 rounded-lg transition-colors
                                                    ${isActiveRoute(item.slug)
                                                        ? 'bg-gray-800 text-vibrantOrange'
                                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                    }`}
                                            >
                                                {item.name}
                                            </button>
                                        </li>
                                    ): null
                                )}
                            </ul>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
}