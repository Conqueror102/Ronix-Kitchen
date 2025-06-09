import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../features/useAuth";
import { useSelector } from "react-redux";
import { selectAuthError, selectAuthLoading } from "../features/authSlice";

export default function SigninPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const error = useSelector(selectAuthError);
  const isLoading = useSelector(selectAuthLoading);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch (error) {
      // Error is handled by the useAuth hook
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full border border-gray-100 bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-vibrantOrange flex items-center justify-center text-white font-bold text-xl">R</div>
          </Link>
          <h2 className="text-3xl font-extrabold text-vibrantOrange">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back to Ramen Paradise
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Show error message if exists */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-black">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
              className={`bg-lightOrange border w-full border-softPeach rounded-lg px-4 py-2 text-deepGreen focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-700"
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <Link to="/auth/forgot-password" className="text-sm text-vibrantOrange hover:text-vibrantOrange/70">
                Forgot your password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
              })}
              className={`bg-lightOrange border w-full border-softPeach rounded-lg px-4 py-2 text-deepGreen focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent ${
                errors.password ? "border-red-500" : "border-gray-700"
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:vibrantorange focus:border-transparent transition-colors`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                {...register("rememberMe")}
                className="h-4 w-4 bg-gray-800 border-gray-700 rounded focus:ring-yellow-500 text-yellow-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-black text-white font-semibold rounded-lg transition duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>

          {/* Link to Sign Up */}
          <div className="text-center text-gray-700">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="font-medium text-vibrantOrange hover:text-text-vibrantOrange/20 transition-colors focus:outline-none"
            >
              Sign up
            </Link>
          </div>
        </form>
        <div className="mt-8 text-center">
          <Link 
            to="/home" 
            className="text-gray-700 hover:text-vibrantOrange transition-colors duration-300 flex items-center justify-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}