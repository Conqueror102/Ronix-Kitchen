import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeaturedMenu = () => {
   const navigate = useNavigate();
  const featuredItems = [
    {
      id: 1,
      name: "Jollof Rice",
      image: "https://images.pexels.com/photos/7439148/pexels-photo-7439148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      price: 14.99,
      description: "Flavorful rice cooked in a rich tomato sauce with peppers, onions, and aromatic spices. Served with your choice of protein.",
      tag: "Bestseller"
    },
    {
      id: 2,
      name: "Egusi Soup",
      image: "https://images.pexels.com/photos/13198023/pexels-photo-13198023.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      price: 15.99,
      description: "Delicious melon seed soup cooked with leafy vegetables, peppers, and your choice of meat or fish. Served with fufu or rice.",
      tag: "Popular"
    },
    {
      id: 3,
      name: "Pounded Yam & Vegetable Soup",
      image: "https://images.pexels.com/photos/7438982/pexels-photo-7438982.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      price: 13.99,
      description: "Smooth, stretchy pounded yam served with a flavorful vegetable soup with your choice of protein.",
      tag: "Vegetarian"
    }
  ];

  return (
    <div className=" bg-lightOrange mx-auto px-4 sm:px-6 md:p-16 ">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-black">
          Our <span className="text-vibrantOrange">Popular Dishes</span>
        </h2>
        <div className="w-24 h-1 bg-vibrantOrange mx-auto mt-4"></div>
        <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
          Explore our most loved Nigerian dishes, meticulously crafted with authentic flavors and fresh ingredients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuredItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
          >
            <div className="relative h-56 overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-vibrantOrange text-white text-xs font-bold rounded-full">
                  {item.tag}
                </span>
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="px-3 py-1 bg-white/90 text-black text-sm font-bold rounded-full">
                  ${item.price}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold text-black mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <button 
                onClick={() => navigate(`/menu/${item.id}`)}
                className="w-full py-2 border border-vibrantOrange text-vibrantOrange hover:bg-vibrantOrange hover:text-white rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                Order Now
                <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-10">
        <button 
          onClick={() => navigate('/menu')}
          className="px-6 py-3 bg-black hover:bg-black/90 text-white rounded-lg transition-all inline-flex items-center"
        >
          View Full Menu
          <ChevronRight className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default FeaturedMenu;
