import React, { useState } from "react"; // Import useState
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

  // State for password visibility
  const [passwordVisible, setPasswordVisible] = useState(false);

  const onSubmit = async (data) => {
    try {
      await login(data);
      // useAuth hook should handle navigation upon successful login
    } catch (err) {
      // Error is handled by the useAuth hook and stored in Redux
      // console.error('Login error:', err); // You can keep this for debugging if needed
    }
  };

  // Toggle function for password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-lightOrange font-inter"> {/* Added bg-lightOrange and font-inter */}
      <div className="max-w-md w-full border border-softPeach bg-white rounded-xl shadow-lg p-8"> {/* Changed border to softPeach */}
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
          {error && (
            <div className="p-3 rounded-lg bg-red-100 border border-red-400 text-red-700 text-sm font-medium"> {/* Updated error styling */}
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
              className={`bg-lightOrange border w-full rounded-lg px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent ${ // Changed text-deepGreen to text-black and focus color
                errors.email ? "border-red-500" : "border-softPeach" // Changed border-gray-700 to border-softPeach
                }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input with Toggle */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <Link to="/auth/forgot-password" className="text-sm text-vibrantOrange hover:text-vibrantOrange/70"> {/* Updated hover color */}
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={passwordVisible ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                })}
                className={`bg-lightOrange border w-full rounded-lg px-4 py-2 pr-10 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent ${ // Changed text-deepGreen to text-black, added pr-10
                  errors.password ? "border-red-500" : "border-softPeach" // Changed border-gray-700 to border-softPeach
                  }`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-vibrantOrange focus:outline-none" // Icon button styling
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

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                {...register("rememberMe")}
                className="h-4 w-4 bg-gray-200 border-softPeach rounded focus:ring-vibrantOrange text-vibrantOrange" // Adjusted colors for consistency
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

          <div className="text-center text-gray-700">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="font-medium text-vibrantOrange hover:text-vibrantOrange/70 transition-colors focus:outline-none" 
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