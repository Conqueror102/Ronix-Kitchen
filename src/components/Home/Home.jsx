import React from 'react';
import { useNavigate } from 'react-router-dom';
import jellof from '../../../assets/tasty-jollof-rice.webp'; // Assuming you have a jellof image in your assets folder
import FeaturedMenu from '../FeaturedMenu';
import Testimonials from '../Testimonial';
import LocationHours from '../Location';

function Home() {
    const navigate = useNavigate();

    const reviews = [
        {
            id: 1,
            name: "Emily Chen",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            rating: 5,
            comment: "The tonkotsu ramen here is absolutely incredible! Rich, flavorful broth that's been simmered for hours. Will definitely be back!",
            date: "2 weeks ago"
        },
        {
            id: 2,
            name: "James Wilson",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            rating: 5,
            comment: "Finally found authentic Japanese ramen in town! The noodles have the perfect texture and the spicy miso broth is to die for.",
            date: "1 month ago"
        },
        {
            id: 3,
            name: "Sophia Martinez",
            avatar: "https://randomuser.me/api/portraits/women/67.jpg",
            rating: 4,
            comment: "Great atmosphere and even better food. The vegetarian ramen options are creative and delicious - not an afterthought like at most places.",
            date: "3 weeks ago"
        }
    ];

    // Featured menu items
    

    return (
        <div className="min-h-screen relative overflow-hidden ">
            
            {/* Hero Section */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center px-4 md:px-16 py-16 gap-10 ">
                {/* Decorative Blobs */}
                <div className="absolute top-0 left-0 w-full blur-2xl  h-full opacity-20 pointer-events-none z-0">
                <div className="absolute bottom-20 left-[580px] w-40 h-40 rounded-full bg-vibrantOrange "></div>
               
            </div>
                {/* Text Section */}
                <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
                     <div className="inline-block mb-3 px-3 py-1 bg-vibrantOrange/10 border border-vibrantOrange/30 text-vibrantOrange rounded-full text-sm font-medium">
            Authentic Nigerian Delicacies
          </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-black drop-shadow-sm">
                        Welcome to <span className="text-vibrantOrange">Ronices Paradise</span>
                    </h1>
                    <p className="text-black/80 mt-2 text-lg leading-relaxed font-medium">
                        Your one-stop destination for authentic, steaming bowls of ramen perfection. Savor the rich broths, handmade noodles, and carefully crafted toppings!
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                        <button
                            onClick={() => navigate('/menu')}
                            className="px-8 py-3 bg-vibrantOrange text-white font-bold rounded-full shadow-lg hover:bg-vibrantOrange/90  transition-all duration-200 hover:-translate-y-1 "
                        >
                            Explore Menu
                        </button>
                        <button
                            onClick={() => navigate('/order')}
                            className="px-8 py-3 bg-black  font-semibold rounded-full text-white shadow hover:-translate-y-1 hover:bg-black/90 hover:text-white transition-all duration-200"
                        >
                            Order Now
                        </button>
                    </div>
                </div>

                {/* Image Section */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <div className="relative rounded-3xl overflow-hidden shadow-lg  bg-white">
                        <img
                            src={jellof}
                            alt="Delicious Ronics Bowl"
                            className="rounded-2xl w-full object-cover h-[350px] md:h-[450px] transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                            <span className="bg-vibrantOrange px-4 py-1 rounded-full text-sm font-bold shadow text-white">
                                Featured Dish
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Menu Section */}
            <div className="">
                <FeaturedMenu/>
                
            </div>

            {/* About Our Ramen Section */}
            <div className=" bg-slate-50  mx-auto md:px-16 sm:px-6 py-16 relative">
                <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-yellow-500/10 blur-3xl"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="w-full md:w-1/2 relative">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="rounded-2xl overflow-hidden h-48 shadow-lg ">
                                    <img 
                                        src="https://i.pinimg.com/736x/60/e4/5f/60e45f67c36e278dde0b3e3f8b09090a.jpg" 
                                        alt="Making noodles" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="rounded-2xl overflow-hidden h-64 shadow-lg ">
                                    <img 
                                        src="https://www.shutterstock.com/shutterstock/photos/2490925811/display_1500/stock-photo-anime-artistic-image-of-anime-style-ramen-shop-interior-wall-realistic-2490925811.jpg" 
                                        alt="Restaurant interior" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4 mt-6">
                                <div className="rounded-2xl overflow-hidden h-64 shadow-lg ">
                                    <img 
                                        src="https://i.pinimg.com/736x/f4/b7/96/f4b79623df981afba08475a4c183ea23.jpg" 
                                        alt="Chef preparing ramen" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="rounded-2xl overflow-hidden h-48 shadow-lg">
                                    <img 
                                        src="https://i.pinimg.com/736x/48/a0/a1/48a0a18242437a61fc78a9fa6109c0f7.jpg" 
                                        alt="Ingredients" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 text-center md:text-left ">
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6">
            The Art of <span className="text-vibrantOrange">Nigerian Cuisine</span>
          </h2>
                        <div className="w-24 h-1 bg-vibrantOrange mx-auto md:mx-0 mb-6"></div>
                        
                        <div className="space-y-6 text-gray-600">
                            <p>
                                At Ramen Paradise, we believe that creating the perfect bowl of ramen is both an art and a science. Our master chefs have trained for years in Japan to perfect the techniques needed to create authentic, soul-warming ramen.
                            </p>
                            <p>
                                Our broths are simmered for 12-18 hours to extract maximum flavor and richness. We make our noodles fresh daily using a traditional recipe, and our toppings are prepared with meticulous attention to detail.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 text-center mt-8 ">
                                <div className=" backdrop-blur-sm shadow-sm bg-softOrange  rounded-xl p-4">
                                    <div className="text-vibrantOrange text-2xl font-bold">12+</div>
                                    <div className="text-black text-sm">Hours of Broth Simmering</div>
                                </div>
                                <div className="bg-softOrange  backdrop-blur-sm  rounded-xl shadow-sm p-4">
                                    <div className="text-vibrantOrange text-2xl font-bold">15+</div>
                                    <div className="text-black text-sm">Dish Varieties</div>
                                </div>
                                <div className="bg-softOrange shadow-sm  rounded-xl p-4">
                                    <div className="text-vibrantOrange text-2xl font-bold">100%</div>
                                    <div className="text-black text-sm">Authentic Recipes</div>
                                </div>
                                <div className=" shadow-sm bg-softOrange  rounded-xl p-4">
                                    <div className="text-vibrantOrange text-2xl font-bold">Daily</div>
                                    <div className="text-black text-sm">Fresh Ingredients</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Special Offers Section */}
            <div className=" mx-auto md:px-16 px-4 bg-gradient-to-b from-gray-900 to-gray-800 sm:px-6 py-16">
                <div className="bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-2xl overflow-hidden shadow-xl border border-yellow-500/30">
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center">
                            <div>
                                <div className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium mb-4">
                                    Limited Time Offer
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                    20% OFF Your First Online Order
                                </h2>
                                <p className="text-gray-300 mb-6">
                                    New customers get 20% off their first online order. Use promo code <span className="text-yellow-400 font-bold">NEWRAMEN20</span> at checkout.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button 
                                        onClick={() => navigate('/order')}
                                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold rounded-lg shadow-lg transform transition hover:-translate-y-1"
                                    >
                                        Order Now
                                    </button>
                                    <button 
                                        onClick={() => navigate('/offers')}
                                        className="px-6 py-3 bg-transparent border border-gray-600 text-gray-300 font-medium rounded-lg hover:border-gray-400 hover:text-white transition"
                                    >
                                        View All Offers
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 relative min-h-[300px]">
                            <img 
                                src="https://i.pinimg.com/736x/10/c0/07/10c007e6562b402b5b90a2bbdb27867c.jpg" 
                                alt="Ramen Special Offer" 
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 md:from-black/40 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Testimonials Section */}
           <div>
            <Testimonials/>
           </div>

            {/* Location & Hours Section */}
     
           <div>
            <LocationHours/>
           </div>
        </div>
    );
}

export default Home;