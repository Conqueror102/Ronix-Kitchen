import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Replace Firebase/Appwrite logic with your backend endpoint
  const resetPassword = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Example: Replace with your backend API call
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: data.email })
      // });
      // const result = await response.json();
      // if (!response.ok) { // Check response.ok for non-2xx status codes
      //   throw new Error(result.message || "Failed to send reset email.");
      // }
      // setSuccessMessage("Password reset email sent. Please check your inbox.");

      // Simulate success for UI
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
      setSuccessMessage("Password reset email sent. Please check your inbox.");
    } catch (error) {
      setError(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-lightOrange font-inter"> {/* Changed background and added font */}
      <div className="max-w-md w-full border border-softPeach bg-white rounded-xl shadow-lg p-8"> {/* Changed border and background */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-vibrantOrange flex items-center justify-center text-white font-bold text-xl">R</div> {/* Changed logo background */}
          </Link>
          <h2 className="text-3xl font-extrabold text-vibrantOrange">Reset your password</h2> {/* Changed text color */}
          <p className="mt-2 text-sm text-gray-700"> {/* Changed text color */}
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(resetPassword)}>
          {/* Show error message if exists */}
          {error && (
            <div className="p-3 rounded-lg bg-red-100 border border-red-400 text-red-700 text-sm font-medium"> {/* Updated error styling */}
              {error}
            </div>
          )}

          {/* Show success message if exists */}
          {successMessage && (
            <div className="p-3 rounded-lg bg-green-100 border border-green-400 text-green-700 text-sm font-medium"> {/* Updated success styling */}
              {successMessage}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-black"> {/* Changed text color */}
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
              className={`w-full px-4 py-2 bg-lightOrange border ${ /* Changed bg-gray-800/60 to bg-lightOrange, text-white to text-black, focus:ring-yellow-500 to focus:ring-vibrantOrange */
                errors.email ? "border-red-500" : "border-softPeach" /* Changed border-gray-700 to border-softPeach */
              } rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibrantOrange focus:border-transparent transition-colors`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-vibrantOrange hover:bg-vibrantOrange/90 text-white font-semibold rounded-lg transition duration-300 flex justify-center items-center" /* Changed gradient to solid vibrantOrange */
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>

          {/* Back to Login */}
          <div className="text-center text-gray-700"> {/* Changed text-gray-400 to text-gray-700 */}
            <Link
              to="/auth/signin"
              className="font-medium text-vibrantOrange hover:text-vibrantOrange/70 transition-colors focus:outline-none" /* Changed text-yellow-400 to text-vibrantOrange */
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
