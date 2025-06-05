import React from "react";

const About = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-2xl w-full bg-white/90 rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-softOrange shadow-md mb-4">
            <img
              src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=256&q=80"
              alt="Owner"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            <span className="bg-clip-text text-transparent bg-vibrantOrange">Kenji Yamamoto</span>
          </h1>
          <h2 className="text-lg text-vibrantOrange font-semibold mb-4">Owner & Founder, Ramen Paradise</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-softOrange via-vibrantOrange to-softOrange mb-6"></div>
          <p className="text-gray-700 text-center mb-4">
            Welcome to <span className="font-semibold text-vibrantOrange">Ramen Paradise</span>!<br />
            My name is Kenji Yamamoto, and I have dedicated my life to sharing the art of authentic Japanese ramen with the world.
          </p>
          <p className="text-gray-700 text-center mb-4">
            Since opening our first location in Tokyo, my mission has been to create a warm, inviting space where everyone can enjoy the flavors of Japan. Every bowl is crafted with passion, tradition, and the freshest ingredients.
          </p>
          <p className="text-gray-700 text-center">
            Thank you for being part of our story. We hope you feel at home at Ramen Paradise!
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;