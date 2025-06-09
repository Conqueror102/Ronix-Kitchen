import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllProductsQuery } from '../../features/RTKQUERY';
import { addToCart } from '../../features/cartSlice';
import { selectIsAuthenticated } from '../../features/authSlice';
// import Header from '../Header/Header';
// import Footer from '../Footer/Footer';

function Menu() {
  const [activeCategory, setActiveCategory] = useState('all');
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data: products = [], isLoading, isError } = useGetAllProductsQuery();

  // Extract unique categories from products
  const categories = [
    { id: 'all', name: 'All' },
    ...Array.from(new Set(products.map(p => p.category))).map(cat => ({ id: cat, name: cat }))
  ];

  // Filter products by category
  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      alert('Please sign in to add items to your cart.');
      return;
    }
    dispatch(addToCart(product));
  };

  return (
    <div className="bg-softOrange min-h-screen flex flex-col">
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

          {/* Category Navigation */}
          <div className="flex flex-wrap justify-center mb-10 gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-vibrantOrange text-white'
                    : 'bg-black text-white hover:bg-gray-700 hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Loading/Error States */}
          {isLoading && <div className="text-center text-lg text-gray-500">Loading menu...</div>}
          {isError && <div className="text-center text-lg text-red-500">Failed to load menu. Please try again later.</div>}

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
            {filteredProducts.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-xl overflow-hidden  shadow-lg flex flex-col sm:flex-row hover:shadow-xl transition duration-300"
              >
                {/* Item Image */}
                <div className="sm:w-1/3 relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover object-center"
                    style={{ height: '100%', minHeight: '140px' }}
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
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{item.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-vibrantOrange font-bold">${item.price?.toFixed(2)}</span>
                    <button
                      className="bg-black text-white text-sm font-bold py-1.5 px-4 rounded-lg hover:bg-black/90 cursor-pointer transition"
                      onClick={() => handleAddToCart(item)}
                      disabled={!isAuthenticated}
                      title={!isAuthenticated ? 'Sign in to order' : ''}
                    >
                      Add to Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Menu;