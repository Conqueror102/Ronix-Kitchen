import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { signin as adminSignin } from '../features/adminSlice';

export default function AdminLogin() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  const [error, setError] = React.useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const adminAuth = useSelector(state => state.admin);
  
  const from = location.state?.from || '/admin/dashboard';
  
  useEffect(() => {
    if (adminAuth.status) {
      navigate(from, { replace: true });
    }
  }, [adminAuth.status, navigate, from]);

  const onSubmit = async (data) => {
    setError(null);

    try {
      // Simulate admin data for UI
      const result = {
        adminId: 'demo-admin-id',
        adminName: 'Admin User',
        adminEmail: data.email,
        adminPermissions: {
          READ: true,
          WRITE: true,
          DELETE: true,
          UPDATE: true
        }
      };

      dispatch(adminSignin(result));
      localStorage.setItem('adminAuth', JSON.stringify({
        adminId: result.adminId,
        timestamp: Date.now()
      }));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-lightOrange">
      <div className="max-w-md w-full border border-softPeach bg-white rounded-xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center mb-3">
            <div className="w-12 h-12 rounded-full bg-vibrantOrange flex items-center justify-center text-white font-bold text-2xl">
              R
            </div>
          </Link>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-vibrantOrange">
            Admin Portal
          </span>
        </div>
        
        {/* Card */}
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-vibrantOrange">Admin Login</h1>
            <p className="text-gray-700 mt-2">
              Sign in to access the admin dashboard
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                Email
              </label>
              <input
                id="email"
                autoComplete="email"
                className={`w-full bg-lightOrange border ${errors.email ? 'border-red-500' : 'border-softPeach'} rounded-lg px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent transition-colors`}
                placeholder="admin@ramenparadise.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`w-full bg-lightOrange border ${errors.password ? 'border-red-500' : 'border-softPeach'} rounded-lg px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent transition-colors`}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-vibrantOrange hover:bg-vibrantOrange/90 text-white font-semibold rounded-lg transition duration-300 flex justify-center items-center"
            >
              {isSubmitting ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              Sign in
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <Link to="/" className="text-vibrantOrange hover:text-vibrantOrange/70 font-medium inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}