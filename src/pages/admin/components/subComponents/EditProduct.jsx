import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
// Import RTK Query hooks
import {
  useGetProductsAdminQuery,
  useUpdateProductMutation,
  useGetProductsByCategoryQuery // Assuming this is the hook for fetching categories
} from '../../../../features/RTKQUERY'; // Adjust path if needed

function EditProduct() {
  // RTK Query hooks for data fetching
  const {
    data: productsData,
    isLoading: areProductsLoading,
    isError: productsFetchError,
    error: productsErrorDetails,
    // refetch: refetchProducts // Not explicitly needed if invalidatesTags is set up for mutations
  } = useGetProductsAdminQuery();

  const {
    data: categoriesData,
    isLoading: areCategoriesLoading,
    isError: categoriesFetchError,
    error: categoriesErrorDetails,
  } = useGetProductsByCategoryQuery(); // Call the hook with ()

  // RTK Query hook for mutation
  const [
    updateProductMutation, // This is the function to call for updating
    {
      isLoading: isUpdatingProduct, // Renamed from isSubmitting
      isSuccess: updateSuccess,
      isError: updateError,
      error: updateErrorData,
      reset: resetUpdateMutationState // To reset mutation state after success/error
    }
  ] = useUpdateProductMutation();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(''); // Unified message for success/error

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm();

  // Combined loading state for initial data fetch
  const isLoadingInitialData = areProductsLoading || areCategoriesLoading;

  // Combine fetch errors
  const fetchError = productsFetchError || categoriesFetchError ?
    (productsErrorDetails?.data?.message || categoriesErrorDetails?.data?.message || 'Failed to load data.') : null;

  // Extract products and categories from RTK Query data
  const products = productsData?.product || [];
  console.log(products)
  const categories = (categoriesData || []).filter(cat => cat.active); // Filter active categories if needed

  // CSS for hiding scrollbar (can be moved to a CSS file for larger projects)
  const scrollbarHideStyles = `
    .hide-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;     /* Firefox */
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;             /* Chrome, Safari and Opera */
    }
  `;

  // Filter products based on search term (name, category, description)
  const filteredProducts = products.filter(product => {
    const productName = product.productName ?? ''; // Use productName as per AddProduct
    const productDescription = product.description ?? '';
    const productCategory = product.category ?? '';

    return productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           productDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
           productCategory.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Effect to handle success/error feedback from the update mutation
  useEffect(() => {
    if (updateSuccess) {
      setFeedbackMessage('Product updated successfully!');
      resetUpdateMutationState(); // Clear mutation state
      const timer = setTimeout(() => setFeedbackMessage(''), 3000); // Clear after 3 seconds
      return () => clearTimeout(timer);
    }
    if (updateError) {
      console.error('Error updating product:', updateErrorData);
      let errorMessage = 'Failed to update product.';
      if (updateErrorData?.data?.message) {
        errorMessage = `Failed to update: ${updateErrorData.data.message}`;
      } else if (updateErrorData?.error) {
        errorMessage = `Update error: ${updateErrorData.error}`;
      }
      setFeedbackMessage(errorMessage);
      resetUpdateMutationState(); // Clear mutation state
      const timer = setTimeout(() => setFeedbackMessage(''), 5000); // Keep error longer
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, updateError, updateErrorData, resetUpdateMutationState]);

  // Handle selecting a product from the list
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    // Use product.image[0] if image is an array, otherwise product.image
    setImagePreview(product.image && product.image.length > 0 ? product.image[0] : null);

    // Set form values using react-hook-form's setValue
    setValue('productName', product.productName); // Use productName
    setValue('productPrice', product.price);
    setValue('productDescription', product.description);
    setValue('category', product.category);
    setValue('featured', product.featured ? 'true' : 'false');
    setValue('inStock', product.inStock ? 'true' : 'false');
  };

  // Handle image file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // This will be a base64 string
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(selectedProduct?.image && selectedProduct.image.length > 0 ? selectedProduct.image[0] : null);
    }
  };

  // Function to handle product update (triggered by form submission)
  const onSubmitUpdateProduct = async (data) => {
    if (!selectedProduct) return; // Ensure a product is selected

    // Construct the payload for the update mutation
    const updatedProductPayload = {
      // Assuming your updateProductMutation expects an 'id' and the updated fields
      id: selectedProduct._id, // Use _id from MongoDB
      productName: data.productName,
      price: data.productPrice,
      description: data.productDescription,
      // Pass the new image data. If imagePreview is base64, your backend needs to handle it.
      // If no new image selected, retain the old one.
      image: imagePreview, // This will be the base64 string or original URL
      category: data.category,
      featured: data.featured === 'true',
      inStock: data.inStock === 'true',
      // You might not need to send dateUpdated from frontend unless backend expects it
      // dateUpdated: new Date().toISOString() 
    };

    try {
      // Call the RTK Query mutation
      await updateProductMutation(updatedProductPayload).unwrap();
      // RTK Query's cache invalidation should automatically refetch products
      // so you don't need to manually update the 'products' state array here.
      // After successful update, re-select the product to reflect latest changes (if any beyond form fields)
      // This is important if your backend sends back a slightly different product object after update
      setSelectedProduct(prev => ({ ...prev, ...updatedProductPayload })); // Basic update for local state
      // A full refetch of all products via RTK Query would be handled by invalidatesTags
    } catch (error) {
      // Errors are handled by the useEffect above
      console.error("Failed to submit update:", error);
    }
  };

  return (
    <div className='flex flex-col space-y-6 max-w-6xl mx-auto'>
      {/* Add the scrollbar hiding styles */}
      <style>{scrollbarHideStyles}</style>

      {/* Header */}
      <div className="bg-white/90 rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">
                Edit <span className="bg-clip-text text-transparent bg-vibrantOrange">Products</span>
              </h2>
              <p className="text-gray-600">
                Update existing products in your menu
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-softOrange via-vibrantOrange to-softOrange mt-4"></div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full lg:w-64 bg-softOrange/40 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Message (Success/Error from mutations) */}
      {feedbackMessage && (
        <div className={`px-4 py-3 rounded-lg flex items-center ${updateSuccess ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={updateSuccess ? "M5 13l4 4L19 7" : "M10 14l2-2m0 0l2-2m-2 2L10 6m2 6l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} />
          </svg>
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product list */}
        <div className="bg-white/90 rounded-xl shadow-md overflow-hidden h-[550px] flex flex-col">
          <div className="px-6 py-4 border-b border-softOrange/40">
            <h3 className="text-lg font-semibold text-black">Select a Product</h3>
          </div>

          {isLoadingInitialData ? (
            <div className="p-6 flex justify-center flex-grow">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-vibrantOrange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-vibrantOrange">Loading products...</span>
              </div>
            </div>
          ) : fetchError ? (
             <div className="p-6 text-center flex-grow flex flex-col justify-center text-red-600">
               <h3 className="text-lg font-semibold mb-2">Error Loading Products</h3>
               <p className="text-sm">{fetchError}</p>
             </div>
          ) : (
            <>
              {filteredProducts.length > 0 ? (
                <div className="divide-y divide-softOrange/40 overflow-y-auto hide-scrollbar flex-grow">
                  {filteredProducts.map(product => (
                    <div
                      key={product._id} // Use product._id for consistency
                      onClick={() => handleSelectProduct(product)}
                      className={`p-4 cursor-pointer hover:bg-softOrange/20 transition-colors ${selectedProduct?._id === product._id ? 'bg-softOrange/40' : ''}`}
                    >
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={product.image && product.image.length > 0 ? product.image[0] : 'https://placehold.co/48x48/F7F7F7/AAAAAA?text=NoImg'}
                            alt={product.productName || 'Product Image'} // Use productName
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-black font-medium">{product.productName}</h4> {/* Use productName */}
                            <span className="text-vibrantOrange font-medium">${(product.price || 0).toFixed(2)}</span>
                          </div>
                          <p className="text-gray-600 text-sm truncate mt-1">{product.description}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs px-2 py-1 bg-softOrange/40 text-black rounded-full capitalize">
                              {product.category}
                            </span>
                            {product.featured && (
                              <span className="ml-2 text-xs px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-full">
                                Featured
                              </span>
                            )}
                            {!product.inStock && (
                              <span className="ml-2 text-xs px-2 py-1 bg-red-500/10 text-red-600 rounded-full">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center flex-grow flex flex-col justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-vibrantOrange mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-vibrantOrange text-lg">No products found</p>
                  <p className="text-gray-600 text-sm mt-1">Try adjusting your search term</p>
                </div>
              )}
            </>
          )}

          {filteredProducts.length > 0 && (
            <div className="px-6 py-4 bg-softOrange/10 border-t border-softOrange/40 mt-auto">
              <p className="text-sm text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                {searchTerm ? ` matching "${searchTerm}"` : ''}
              </p>
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2">
          {selectedProduct ? (
            <div className="bg-white/90 rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-softOrange/40">
                <h3 className="text-lg font-semibold text-black">Edit Product Information</h3>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmitUpdateProduct)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="productName" className="block text-black mb-2 font-medium">Product Name</label>
                      <input
                        type="text"
                        id="productName"
                        placeholder="Enter product name"
                        className={`w-full bg-softOrange/40 text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange ${errors.productName ? 'border border-red-500' : ''}`}
                        {...register("productName", { required: true })}
                      />
                      {errors.productName && (
                        <span className="text-red-500 text-sm mt-1">Product name is required</span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="productPrice" className="block text-black mb-2 font-medium">Product Price (USD)</label>
                      <input
                        type="number"
                        id="productPrice"
                        step="0.01"
                        placeholder="0.00"
                        className={`w-full bg-softOrange/40 text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange ${errors.productPrice ? 'border border-red-500' : ''}`}
                        {...register("productPrice", {
                          required: true,
                          min: 0.01,
                          valueAsNumber: true
                        })}
                      />
                      {errors.productPrice && (
                        <span className="text-red-500 text-sm mt-1">Valid price is required</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="category" className="block text-black mb-2 font-medium">Category</label>
                      <select
                        id="category"
                        className="w-full bg-softOrange/40 text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange"
                        {...register("category", { required: true })}
                        disabled={areCategoriesLoading}
                      >
                        <option value="">Select a category</option>

                        {areCategoriesLoading ? (
                          <option value="" disabled>Loading categories...</option>
                        ) : categories.length > 0 ? (
                          categories.map(category => (
                            <option key={category._id || category.id} value={category.name?.toLowerCase()}>
                              {category.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No categories available</option>
                        )}
                      </select>

                      {areCategoriesLoading && (
                        <div className="mt-1 flex items-center">
                          <svg className="animate-spin h-4 w-4 text-vibrantOrange mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm text-gray-600">Loading available categories...</span>
                        </div>
                      )}

                      {errors.category && (
                        <span className="text-red-500 text-sm mt-1">Please select a category</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-black mb-2 font-medium">Featured</label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="true"
                              className="form-radio h-4 w-4 text-vibrantOrange bg-softOrange border-softOrange focus:ring-0"
                              {...register("featured")}
                            />
                            <span className="ml-2 text-black">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="false"
                              className="form-radio h-4 w-4 text-vibrantOrange bg-softOrange border-softOrange focus:ring-0"
                              {...register("featured")}
                            />
                            <span className="ml-2 text-black">No</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-black mb-2 font-medium">In Stock</label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="true"
                              className="form-radio h-4 w-4 text-green-500 bg-softOrange border-softOrange focus:ring-0"
                              {...register("inStock")}
                            />
                            <span className="ml-2 text-black">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="false"
                              className="form-radio h-4 w-4 text-red-500 bg-softOrange border-softOrange focus:ring-0"
                              {...register("inStock")}
                            />
                            <span className="ml-2 text-black">No</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="productDescription" className="block text-black mb-2 font-medium">Description</label>
                    <textarea
                      id="productDescription"
                      rows="4"
                      placeholder="Describe your product..."
                      className={`w-full bg-softOrange/40 text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange ${errors.productDescription ? 'border border-red-500' : ''} hide-scrollbar`}
                      {...register("productDescription", { required: true, minLength: 10 })}
                    ></textarea>
                    {errors.productDescription && (
                      <span className="text-red-500 text-sm mt-1">Description should be at least 10 characters</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-black mb-2 font-medium">Product Image</label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-softOrange border-dashed rounded-lg">
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
                          <div className="flex text-sm text-black">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-softOrange rounded-md font-medium text-vibrantOrange hover:text-white hover:bg-vibrantOrange focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-vibrantOrange"
                            >
                              <span className="px-3 py-2 rounded-md">Change image</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="pl-1 pt-2">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-600">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-black mb-2 font-medium">Image Preview</label>
                      {imagePreview ? (
                        <div className="mt-1 relative aspect-video rounded-lg overflow-hidden bg-softOrange/40 border border-softOrange">
                          <img
                            src={imagePreview}
                            alt="Product Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center justify-center h-40 rounded-lg bg-softOrange/40 border border-softOrange">
                          <p className="text-vibrantOrange">No image selected</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isUpdatingProduct}
                      className={`flex-1 px-4 py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition duration-300 flex items-center justify-center ${isUpdatingProduct ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isUpdatingProduct ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="px-4 py-3 bg-softOrange/40 hover:bg-softOrange text-black font-medium rounded-lg transition duration-300 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white/90 rounded-xl shadow-md overflow-hidden">
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-vibrantOrange mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="text-xl font-semibold text-black mb-2">Select a Product to Edit</h3>
                <p className="text-gray-600 max-w-md">
                  Choose a product from the list to edit its details, update pricing, change images, or modify its availability status.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditProduct;
