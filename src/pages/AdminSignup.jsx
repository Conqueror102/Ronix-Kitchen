import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAdminAuth } from '../features/useAdminAuth';
import { useSelector } from 'react-redux';
import { selectAdminError, selectAdminLoading, selectIsAdmin } from '../features/adminSlice';

export default function AdminSignup() {
  const navigate = useNavigate();
  const { signup } = useAdminAuth();
  const error = useSelector(selectAdminError);
  const isLoading = useSelector(selectAdminLoading);
  const isAdmin = useSelector(selectIsAdmin);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch("password");
  const [successMessage, setSuccessMessage] = React.useState("");

  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const onSubmit = async (data) => {
    try {
      setSuccessMessage("Creating admin account...");
      // Add role to the signup data
      const adminData = {
        ...data,
        role: 'admin'
      };
      await signup(adminData);
      setSuccessMessage("Admin account created successfully! Redirecting to dashboard...");
    } catch (error) {
      setSuccessMessage("");
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-lightOrange">
      <div className="max-w-md w-full border border-softPeach bg-white rounded-xl shadow-lg p-8">
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

        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-vibrantOrange">Create Admin Account</h1>
            <p className="text-gray-700 mt-2">
              Set up your admin account for Ramen Paradise
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 p-3 rounded-lg bg-green-100 border border-green-400 text-green-700 text-sm font-medium">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-100 border border-red-400 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-black mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                className={`w-full bg-lightOrange border ${errors.fullName ? 'border-red-500' : 'border-softPeach'} rounded-lg px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent transition-colors`}
                placeholder="John Doe"
                {...register('fullName', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
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
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-black mb-1">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                className={`w-full bg-lightOrange border ${errors.phoneNumber ? 'border-red-500' : 'border-softPeach'} rounded-lg px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent transition-colors`}
                placeholder="+1234567890"
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
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
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`w-full bg-lightOrange border ${errors.confirmPassword ? 'border-red-500' : 'border-softPeach'} rounded-lg px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent transition-colors`}
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || "Passwords do not match"
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-vibrantOrange hover:bg-vibrantOrange/90 text-white font-semibold rounded-lg transition duration-300 flex justify-center items-center"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              Create Admin Account
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/admin/login" className="text-vibrantOrange hover:text-vibrantOrange/70 font-medium">
              Already have an admin account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 