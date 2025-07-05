import React, { useState } from 'react'; // Import useState
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAdminAuth } from '../features/useAdminAuth';
import { useSelector } from 'react-redux';
import { selectAdminError, selectAdminLoading, selectIsAdmin } from '../features/adminSlice';

export default function AdminSignup() {
  const navigate = useNavigate();
  const { signup } = useAdminAuth();
  // Using error and isLoading from Redux for display
  const error = useSelector(selectAdminError);
  const isLoading = useSelector(selectAdminLoading);
  const isAdmin = useSelector(selectIsAdmin);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch("password");
  const [successMessage, setSuccessMessage] = React.useState("");

  // New state for password visibility
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const onSubmit = async (data) => {
    setSuccessMessage("Creating admin account..."); // Indicate processing
    try {
      const adminData = {
        ...data,
        role: 'admin'
      };
      await signup(adminData);
      setSuccessMessage("Admin account created successfully! Redirecting to dashboard...");
    } catch (err) {
      // Clear success message and let Redux error state handle the display
      setSuccessMessage("");
      console.error('Signup error:', err);
      // The `error` variable (from `selectAdminError`) should now contain the API error message.
      // No need to manually set a local error message here if Redux is handling it.
    }
  };

  // Toggle function for main password field
  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  // Toggle function for confirm password field
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(prev => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-lightOrange font-inter"> {/* Added font-inter for consistency */}
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

          {/* This `error` comes from Redux (selectAdminError) and will display API errors */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-100 border border-red-400 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name Field */}
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

            {/* Email Field */}
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

            {/* Phone Number Field */}
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

            {/* Password Field with Toggle */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={passwordVisible ? 'text' : 'password'}
                  className={`w-full bg-lightOrange border ${errors.password ? 'border-red-500' : 'border-softPeach'} rounded-lg px-4 py-2 pr-10 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent transition-colors`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-vibrantOrange focus:outline-none"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .472-1.579 1.253-3.091 2.384-4.36M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1.667 4.088c-1.54 1.54-1.54 4.088 0 5.628l2.548 2.548a10.035 10.035 0 00-.001 2.544M22.333 19.912c1.54-1.54 1.54-4.088 0-5.628l-2.548-2.548a10.035 10.035 0 01-.001-2.544M12 21a9 9 0 01-9-9c0-.987.16-1.93.458-2.825m18.084 5.65c.298.895.458 1.838.458 2.825a9 9 0 01-9 9" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field with Toggle */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  className={`w-full bg-lightOrange border ${errors.confirmPassword ? 'border-red-500' : 'border-softPeach'} rounded-lg px-4 py-2 pr-10 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent transition-colors`}
                  placeholder="••••••••"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || "Passwords do not match"
                  })}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-vibrantOrange focus:outline-none"
                  aria-label={confirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
                >
                  {confirmPasswordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .472-1.579 1.253-3.091 2.384-4.36M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1.667 4.088c-1.54 1.54-1.54 4.088 0 5.628l2.548 2.548a10.035 10.035 0 00-.001 2.544M22.333 19.912c1.54-1.54 1.54-4.088 0-5.628l-2.548-2.548a10.035 10.035 0 01-.001-2.544M12 21a9 9 0 01-9-9c0-.987.16-1.93.458-2.825m18.084 5.65c.298.895.458 1.838.458 2.825a9 9 0 01-9 9" />
                    </svg>
                  )}
                </button>
              </div>
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