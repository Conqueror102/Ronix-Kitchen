import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Emily Chen",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
      comment: "The Jollof rice here is absolutely incredible! Rich, flavorful and perfectly seasoned. Will definitely be back!",
      date: "2 weeks ago"
    },
    {
      id: 2,
      name: "James Wilson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
      comment: "Finally found authentic Nigerian food in town! The Egusi soup has the perfect texture and the pounded yam is to die for.",
      date: "1 month ago"
    },
    {
      id: 3,
      name: "Sophia Martinez",
      avatar: "https://randomuser.me/api/portraits/women/67.jpg",
      rating: 4,
      comment: "Great atmosphere and even better food. The vegetarian options are creative and delicious - not an afterthought like at most places.",
      date: "3 weeks ago"
    }
  ];

  return (
    <div className=" bg-softOrange mx-auto px-4  sm:px-6 lg:px-16  py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-black">
          What Our <span className="text-vibrantOrange">Customers Say</span>
        </h2>
        <div className="w-24 h-1 bg-vibrantOrange mx-auto mt-4"></div>
        <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
          Don't just take our word for it. See what our customers have to say about their Ronices Paradise experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-softPeach/50"
          >
            {/* Rating Stars */}
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-5 w-5 ${i < review.rating ? 'text-vibrantOrange fill-vibrantOrange' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            
            <p className="text-gray-700 italic mb-6">"{review.comment}"</p>
            
            <div className="flex items-center">
              <img 
                src={review.avatar} 
                alt={review.name} 
                className="h-10 w-10 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="text-black font-medium">{review.name}</h4>
                <p className="text-gray-500 text-sm">{review.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-10">
        <button 
          onClick={() => window.open('https://www.google.com/maps', '_blank')}
          className="inline-flex items-center px-6 py-3 bg-black hover:bg-black/90 text-white rounded-lg"
        >
          Leave a Review
          <Star className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Testimonials;