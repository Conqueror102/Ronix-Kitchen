import React from 'react';

function Location() {
  const operatingHours = [
    { day: 'Monday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Tuesday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Wednesday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Thursday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Friday', hours: '11:00 AM - 11:00 PM' },
    { day: 'Saturday', hours: '12:00 PM - 11:00 PM' },
    { day: 'Sunday', hours: '12:00 PM - 10:00 PM' },
  ];

  return (
    <div className="bg-softOrange min-h-screen text-white">
      
      
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        {/* Location Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 rounded-full text-sm font-medium mb-3">
            Find Us
          </span>
          <h1 className="text-3xl sm:text-4xl text-black md:text-5xl font-extrabold">
            Our <span className="text-vibrantOrange to-red-500">Location</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-gray-400 text-base sm:text-lg">
            Visit us in the heart of the city to experience authentic Japanese ramen in a warm, inviting atmosphere.
          </p>
          <div className="w-24 h-1 bg-vibrantOrange mx-auto mt-4"></div>
        </div>
        
        {/* Two-column layout for map and info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Map Section */}
          <div className="h-full">
            <div className="relative bg-white backdrop-blur-sm rounded-xl overflow-hidden border border-softOrange shadow-md h-full">
              {/* Placeholder for actual map integration */}
              <div className="aspect-video w-full lg:h-full bg-gray-800 relative overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12962.244666694765!2d139.7671248!3d35.68139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188bfbd891936f%3A0x51a75203f467fb0!2sTokyo%20Station!5e0!3m2!1sen!2sus!4v1682464125889!5m2!1sen!2sus" 
                  className="absolute inset-0 w-full h-full border-0" 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade">
                </iframe>
                <div className="absolute inset-0 pointer-events-none border-4 border-yellow-500/20 rounded-xl"></div>
              </div>
            </div>
          </div>
          
          {/* Location Info */}
          <div className="flex flex-col h-full">
            {/* Address Card */}
            <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-softOrange shadow-md mb-6">
              <div className="flex flex-row gap-4 items-start">
                <div className="bg-softOrange p-3 rounded-lg text-vibrantOrange">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Our Address</h3>
                  <p className="text-gray-500">
                    123 Noodle Street<br />
                    Ramen District<br />
                    Tokyo, Japan 100-0005
                  </p>
                  
                  <div className="mt-4">
                    <a 
                      href="https://goo.gl/maps/1JnnsGxARL3rMuKH8" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-black text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-red-600 transition"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Card */}
            <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-softOrange shadow-md mb-6">
              <div className="flex flex-row gap-4 items-start">
                <div className="bg-softOrange p-3 rounded-lg text-vibrantOrange">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Contact Us</h3>
                  <p className="text-gray-500 mb-2">
                    <span className="text-vibrantOrange font-semibold">Phone:</span> (123) 456-7890
                  </p>
                  <p className="text-gray-500 mb-2">
                    <span className="text-vibrantOrange font-semibold">Email:</span> info@ramenparadise.com
                  </p>
                  <p className="text-gray-500">
                    <span className="text-vibrantOrange font-semibold">Reservations:</span> reservations@ramenparadise.com
                  </p>
                </div>
              </div>
            </div>
            
            {/* Hours Card */}
            <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-softOrange shadow-md flex-grow">
              <div className="flex flex-row gap-4 items-start">
                <div className="bg-softOrange p-3 rounded-lg text-vibrantOrange">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-4">Operating Hours</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {operatingHours.map((item, index) => (
                      <div 
                        key={index} 
                        className="py-2 border-b border-softOrange last:border-0 sm:last:border-b sm:even:border-0"
                      >
                        <p className="text-vibrantOrange font-semibold">{item.day}</p>
                        <p className="text-gray-500">{item.hours}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        
        {/* Transportation Section */}
       
         
      </div>
    </div>
  );
}

export default Location;