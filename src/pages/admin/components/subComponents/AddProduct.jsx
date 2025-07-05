import React, { useState, useRef, useEffect } from 'react';
import { useForm } from "react-hook-form";
// Import RTK Query hooks for products and categories
import { useCreateProductMutation, useGetAllCategoriesQuery } from '../../../../features/RTKQUERY'; // Ensure this path is correct

function AddProduct() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // RTK Query states: isLoading, isSuccess, isError, and the error object for product creation
  const [createProduct, { isLoading: isCreatingProduct, isSuccess: createSuccess, isError: createError, error: createErrorData, reset: resetMutationState }] = useCreateProductMutation();

  // RTK Query hook for fetching categories
  const {
    data: categoriesData,
    isLoading: areCategoriesLoading,
    isError: categoriesFetchError,
    error: categoriesErrorDetails,
  } = useGetAllCategoriesQuery(); // Fetch all categories

  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    reset: resetFormFields, // Renamed to avoid conflict with RTK Query's reset
    formState: { errors }
  } = useForm();

  const formValues = watch();

  // Extract categories from RTK Query data, filter for active ones
  // FIX: Access the 'categories' array from the categoriesData object
  const categories = (categoriesData?.categories || []).filter(cat => cat.active);

  // Consolidated loading and error for initial data (categories)
  const categoriesLoading = areCategoriesLoading;
  const categoriesError = categoriesFetchError ? (categoriesErrorDetails?.data?.message || 'Failed to load categories.') : null;


  // Centralized success and error handling using RTK Query states
  useEffect(() => {
    // Handle Success
    if (createSuccess) {
      setSuccessMessage('Product added successfully! Form will reset shortly.');
      setErrorMessage(''); // Clear any previous error messages
      resetFormFields(); // Reset react-hook-form fields
      resetImage(); // Clear image preview state
      resetMutationState(); // Clear RTK Query mutation state (important for re-submission)

      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000); // Clear success message after 3 seconds
      return () => clearTimeout(timer);
    }

    // Handle Errors
    if (createError) {
      let displayMessage = 'Failed to add product. Please try again.';

      if (createErrorData) {
        console.error('Full RTK Query Error Object:', createErrorData);

        // Scenario 1: Backend sent HTML (like "Internal Server Error" page)
        if (typeof createErrorData.data === 'string' && createErrorData.data.startsWith('<!DOCTYPE html>')) {
          displayMessage = `Server encountered an unhandled error (${createErrorData.originalStatus || '500'}). Check backend console logs for details.`;
        }
        // Scenario 2: Backend sent a structured JSON error
        else if (createErrorData.data && typeof createErrorData.data === 'object' && createErrorData.data.message) {
          displayMessage = createErrorData.data.message;
        }
        // Scenario 3: RTK Query internal error (e.g., SyntaxError from parsing bad JSON)
        else if (createErrorData.error) {
          displayMessage = `Frontend parsing error: ${createErrorData.error}. Backend might not be sending valid JSON.`;
        }
      }

      setErrorMessage(displayMessage);
      setSuccessMessage(''); // Clear any previous success messages
      resetMutationState(); // Reset RTK Query mutation state

      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 5000); // Keep error message longer
      return () => clearTimeout(timer);
    }
  }, [createSuccess, createError, createErrorData, resetFormFields, resetMutationState]);


  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file (PNG, JPG, GIF).');
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setErrorMessage('Image file size exceeds 10MB. Please choose a smaller image.');
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
        return;
      }

      setImage(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setErrorMessage(null); // Clear image-related error if valid
    } else {
      resetImage();
    }
  };

  const resetImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Clears the file input field
    }
  };

  const addProduct = async (data) => {
    if (!image) {
      setErrorMessage('Please select an image for the product.');
      return;
    }

    setSuccessMessage(''); // Clear previous messages
    setErrorMessage(''); // Clear previous messages

    const formData = new FormData();
    formData.append('productName', data.productName);
    formData.append('price', data.productPrice);
    formData.append('description', data.productDescription);
    formData.append('category', data.category); // This will now be the category _id
    formData.append('productImage', image); // Ensure this matches backend Multer field name
    formData.append('featured', data.featured === 'true');

    try {
      await createProduct(formData).unwrap(); // .unwrap() ensures error is thrown for RTK Query to catch
      // Success/Error will be handled by the useEffect watching createSuccess/createError
    } catch (error) {
      // This catch block is primarily for network errors (e.g., server completely down, CORS issue)
      // or other issues before RTK Query can process the response.
      // RTK Query errors from .unwrap() are now fully handled by the useEffect.
      console.error("Direct catch in addProduct (likely network error or pre-RTK issue):", error);
      setErrorMessage(`Network error: ${error.message}. Is backend reachable?`);
    }
  };

  return (
    <div className='flex flex-col space-y-6 max-w-6xl mx-auto'>
      {/* Header Section */}
      <div className="bg-white/90 rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">
                Add <span className="bg-clip-text text-transparent bg-vibrantOrange">New Product</span>
              </h2>
              <p className="text-gray-600">
                Effortlessly add delicious new items to your menu and showcase them to your customers.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-softOrange via-vibrantOrange to-softOrange mt-4 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Alert Messages (Success/Error) */}
      {successMessage && (
        <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-lg flex items-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/10 text-red-600 px-4 py-3 rounded-lg flex items-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2L10 6m2 6l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Main Content: Form and Preview Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Form Section */}
        <div className="bg-white/90 rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-softOrange/40">
            <h3 className="text-lg font-semibold text-black">Product Information</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit(addProduct)} className="space-y-6">
              {/* Product Name */}
              <div>
                <label htmlFor="productName" className="block text-black mb-2 font-medium">Product Name</label>
                <input
                  type="text"
                  id="productName"
                  placeholder="e.g., Spicy Miso Ramen"
                  className={`w-full bg-softOrange/40 text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange ${errors.productName ? 'border border-red-500' : ''}`}
                  {...register("productName", { required: "Product name is required" })}
                />
                {errors.productName && (
                  <span className="text-red-500 text-sm mt-1">{errors.productName.message}</span>
                )}
              </div>

              {/* Product Price */}
              <div>
                <label htmlFor="productPrice" className="block text-black mb-2 font-medium">Product Price (USD)</label>
                <input
                  type="number"
                  id="productPrice"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full bg-softOrange/40 text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange ${errors.productPrice ? 'border border-red-500' : ''}`}
                  {...register("productPrice", {
                    required: "Product price is required",
                    min: { value: 0.01, message: "Price must be greater than 0" },
                    valueAsNumber: true
                  })}
                />
                {errors.productPrice && (
                  <span className="text-red-500 text-sm mt-1">{errors.productPrice.message}</span>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-black mb-2 font-medium">Category</label>
                <select
                  id="category"
                  className={`w-full bg-softOrange/40 text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange ${errors.category ? 'border border-red-500' : ''}`}
                  {...register("category", { required: "Please select a category" })}
                  disabled={categoriesLoading}
                >
                  <option value="">Select a category</option>
                  {categoriesLoading ? (
                    <option value="" disabled>Loading categories...</option>
                  ) : categories.length > 0 ? (
                    categories.map(category => (
                      <option key={category._id} value={category._id}> {/* FIX: Value is now _id */}
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No categories available</option>
                  )}
                </select>

                {categoriesLoading && (
                  <div className="mt-1 flex items-center">
                    <svg className="animate-spin h-4 w-4 text-vibrantOrange mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-gray-600">Loading available categories...</span>
                  </div>
                )}
                {categoriesError && (
                    <span className="text-red-500 text-sm mt-1">{categoriesError}</span>
                )}
                {errors.category && (
                  <span className="text-red-500 text-sm mt-1">{errors.category.message}</span>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="productDescription" className="block text-black mb-2 font-medium">Description</label>
                <textarea
                  id="productDescription"
                  rows="4"
                  placeholder="A detailed description of your delicious product..."
                  className={`w-full bg-softOrange/40 text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange ${errors.productDescription ? 'border border-red-500' : ''}`}
                  {...register("productDescription", {
                    required: "Product description is required",
                    minLength: { value: 20, message: "Description must be at least 20 characters" } // Increased minLength for better descriptions
                  })}
                ></textarea>
                {errors.productDescription && (
                  <span className="text-red-500 text-sm mt-1">{errors.productDescription.message}</span>
                )}
              </div>

              {/* Featured Product */}
              <div>
                <label className="block text-black mb-2 font-medium">Featured Product</label>
                <div className="flex space-x-6"> {/* Increased space for clarity */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="true"
                      className="form-radio h-4 w-4 text-vibrantOrange bg-softOrange border-softOrange focus:ring-0"
                      {...register("featured")}
                    />
                    <span className="ml-2 text-black">Yes, mark as featured</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="false"
                      defaultChecked
                      className="form-radio h-4 w-4 text-vibrantOrange bg-softOrange border-softOrange focus:ring-0"
                      {...register("featured")}
                    />
                    <span className="ml-2 text-black">No</span>
                  </label>
                </div>
                <p className="text-gray-600 text-xs mt-2">
                    Featured products appear prominently on your homepage or special sections.
                </p>
              </div>

              {/* Product Image Upload */}
              <div>
                <label className="block text-black mb-2 font-medium">Product Image</label>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${!image && errorMessage ? 'border-red-500' : 'border-softOrange'} border-dashed rounded-lg`}>
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-vibrantOrange"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-black flex-col">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-softOrange rounded-md font-medium text-vibrantOrange hover:text-white hover:bg-vibrantOrange focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-vibrantOrange"
                      >
                        <span className="px-4 py-3 text-[16px] rounded-md">Upload an image</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/png, image/jpeg, image/gif" // Specific file types
                          onChange={handleImageChange}
                          ref={fileInputRef}
                        />
                      </label>

                      <p className="pl-1 pt-2">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-600">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                {/* Image preview and remove button */}
                {imagePreview && (
                  <div className="mt-3 flex items-center space-x-3 p-3 bg-softOrange/20 rounded-lg">
                    <div className="h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Image preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-black">{image?.name || 'Selected Image'}</p>
                        <p className="text-xs text-gray-600">{(image?.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={resetImage}
                      className="ml-auto text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {/* Specific error message for missing image, displayed only if other errors aren't showing */}
                {!image && errors.image && (
                    <span className="text-red-500 text-sm mt-1">{errors.image.message}</span>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isCreatingProduct}
                  className={`w-full px-4 py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition duration-300 flex items-center justify-center ${isCreatingProduct ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isCreatingProduct ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Product...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Product Card Preview Section */}
        <div className="bg-white/90 rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-softOrange/40">
            <h3 className="text-lg font-semibold text-black">Live Product Card Preview</h3>
          </div>
          <div className="p-6">
            {imagePreview ? (
              <div className="relative aspect-square rounded-xl overflow-hidden mb-6 border border-softOrange/40 shadow-inner">
                <img
                  src={imagePreview}
                  alt="Product Visual Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={resetImage}
                  className="absolute top-3 right-3 bg-black bg-opacity-60 text-white rounded-full p-2 hover:bg-opacity-80 transition"
                  aria-label="Remove image"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-softOrange/20 rounded-xl border border-softOrange border-dashed mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-vibrantOrange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 text-vibrantOrange text-lg font-medium">No Image Selected</p>
                <p className="text-gray-600 text-sm mt-2">Upload an image to see its preview here.</p>
              </div>
            )}

            {/* Product Card Styled Preview */}
            <div className="p-4 bg-softOrange/20 rounded-xl border border-softOrange">
              <h4 className="font-medium text-black mb-3">How it will look on your menu:</h4>
              <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.01]">
                <div className="h-48 overflow-hidden bg-gray-200 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={formValues?.productName || "Product"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="h-20 w-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 3h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2zm0 2v14h16V5H4zm2 2h4v4H6V7zm6 0h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6v-2zM6 14h4v4H6v-4z"/>
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-black font-semibold text-lg line-clamp-1">
                      {formValues?.productName || "New Product Name"}
                    </h5>
                    <span className="text-vibrantOrange font-bold text-lg">
                      ${formValues?.productPrice?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {formValues?.productDescription || "A captivating description of your new menu item, highlighting its unique flavors and ingredients."}
                  </p>
                  <div className="flex justify-between items-center mt-4 text-xs font-medium">
                    <span className="px-2 py-1 bg-softOrange/40 text-black rounded-full capitalize">
                      {/* Display category name from categories list based on selected _id */}
                      {categories.find(cat => cat._id === formValues?.category)?.name || "Category"}
                    </span>
                    {formValues?.featured === 'true' && (
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-full">
                            Featured
                        </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <button className="w-full px-3 py-2 bg-black hover:bg-gray-900 text-sm font-medium rounded transition duration-300">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informational Hint */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="ml-3">
          <h4 className="text-blue-500 font-medium">Tip for Success</h4>
          <p className="text-gray-600 text-sm mt-1">
            Use high-quality, well-lit images to make your products more appealing. A good description can significantly boost customer interest!
          </p>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
