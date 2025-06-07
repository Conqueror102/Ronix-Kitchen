import React from 'react';
import { MapPin, Clock, Phone, Mail, ArrowRight } from 'lucide-react';



const LocationHours = ({ navigate }) => {
  return (
    <div className=" mx-auto px-4 sm:px-6 lg:px-16 py-16">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-softPeach/50">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-deepGreen mb-4">Visit Us</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-vibrantOrange mt-1 mr-3" />
                <div>
                  <h3 className="text-deepGreen font-medium">Address</h3>
                  <p className="text-gray-700">123 Flavor Street, Nigerian Quarter</p>
                  <p className="text-gray-700">Lagos, Nigeria 101233</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-vibrantOrange mt-1 mr-3" />
                <div>
                  <h3 className="text-deepGreen font-medium">Hours</h3>
                  <p className="text-gray-700">Monday - Friday: 11:00 AM - 10:00 PM</p>
                  <p className="text-gray-700">Saturday - Sunday: 12:00 PM - 11:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-vibrantOrange mt-1 mr-3" />
                <div>
                  <h3 className="text-deepGreen font-medium">Contact</h3>
                  <p className="text-gray-700">Phone: (234) 456-7890</p>
                  <p className="text-gray-700">Email: info@ronicesparadise.com</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/location')}
              className="mt-6 w-full px-4 py-2 bg-black hover:bg-deepGreen/90 text-white rounded-lg transition duration-300 flex items-center justify-center"
            >
              Get Directions
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-softPeach/50">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-deepGreen mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-700 mb-6">
              Stay updated with new menu items, special offers, and exclusive events. Sign up for our newsletter!
            </p>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-deepGreen mb-1">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full bg-lightOrange border border-softPeach rounded-lg px-4 py-2 text-deepGreen focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-deepGreen mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full bg-lightOrange border border-softPeach rounded-lg px-4 py-2 text-deepGreen focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent"
                  placeholder="Your email address"
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox"
                  id="offers"
                  className="h-4 w-4 text-vibrantOrange focus:ring-vibrantOrange border-softPeach rounded"
                />
                <label htmlFor="offers" className="ml-2 block text-sm text-gray-700">
                  I want to receive special offers and promotions
                </label>
              </div>
              
              <button 
                type="submit"
                className="w-full px-4 py-2 bg-vibrantOrange hover:bg-vibrantOrange/90 text-white font-medium rounded-lg transition duration-300 flex items-center justify-center"
              >
                Subscribe
                <Mail className="ml-2 h-4 w-4" />
              </button>
            </form>
            
            <p className="text-gray-500 text-xs mt-4">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
              We'll never share your information with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationHours;