import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from './features/useAuth';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { toast } from 'react-hot-toast';

function App() {
  const auth = useSelector(state => state.auth);
  const { handleTokenExpiration } = useAuth();
  const navigate = useNavigate();

  // Check for token expiration on mount and when auth state changes
  useEffect(() => {
    if (auth.token) {
      try {
        // Decode the JWT token to check expiration
        const tokenData = JSON.parse(atob(auth.token.split('.')[1]));
        const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();

        if (currentTime >= expirationTime) {
          // Token has expired
          handleTokenExpiration();
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
        // If there's an error decoding the token, assume it's invalid
        handleTokenExpiration();
      }
    }
  }, [auth.token, handleTokenExpiration]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;