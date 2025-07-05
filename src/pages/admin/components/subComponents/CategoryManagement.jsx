import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../../../../features/RTKQUERY'; // Adjust path as needed

function CategoryManagement() {
  // RTK Query Hooks for Data Operations
  const {
    data: categoriesData,
    isLoading: areCategoriesLoading,
    isError: categoriesFetchError,
    error: categoriesErrorDetails,
    refetch: refetchCategories // Keep refetch in case manual refetch is needed
  } = useGetAllCategoriesQuery();

  const [createCategory, {
    isLoading: isCreatingCategory,
    isSuccess: createSuccess,
    isError: createError,
    error: createErrorData,
    reset: resetCreateMutationState
  }] = useCreateCategoryMutation();

  const [updateCategory, {
    isLoading: isUpdatingCategory,
    isSuccess: updateSuccess,
    isError: updateError,
    error: updateErrorData,
    reset: resetUpdateMutationState
  }] = useUpdateCategoryMutation();

  const [deleteCategory, {
    isLoading: isDeletingCategory,
    isSuccess: deleteSuccess,
    isError: deleteError,
    error: deleteErrorData,
    reset: resetDeleteMutationState
  }] = useDeleteCategoryMutation();

  // Local UI State
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      active: true
    }
  });

  // Derived state from RTK Query data
  // FIX: Access the 'categories' array from the categoriesData object as it now includes productCount
  const categories = categoriesData?.categories || [];

  // Unified loading state for form submission/operations
  const isProcessing = isCreatingCategory || isUpdatingCategory || isDeletingCategory;

  // Effect to handle success/error messages from all mutations
  useEffect(() => {
    let timer;
    if (createSuccess) {
      setStatusMessage({ type: 'success', message: 'Category created successfully!' });
      reset(); // Reset form fields
      setIsEditing(false); // Ensure form switches back to add mode
      setEditingId(null);
      resetCreateMutationState();
      timer = setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
    } else if (updateSuccess) {
      setStatusMessage({ type: 'success', message: 'Category updated successfully!' });
      reset(); // Reset form fields
      setIsEditing(false); // Switch back to add mode
      setEditingId(null);
      resetUpdateMutationState();
      timer = setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
    } else if (deleteSuccess) {
      setStatusMessage({ type: 'success', message: 'Category deleted successfully!' });
      setShowConfirmDelete(false); // Close modal
      setCategoryToDelete(null); // Clear category to delete
      resetDeleteMutationState();
      timer = setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
    } else if (createError || updateError || deleteError) {
      const errorObj = createErrorData || updateErrorData || deleteErrorData;
      let msg = 'An error occurred. Please try again.';
      if (errorObj?.data?.message) {
        msg = errorObj.data.message;
      } else if (errorObj?.error) {
        msg = `Error: ${errorObj.error}`;
      } else if (typeof errorObj === 'string') {
        msg = errorObj; // Fallback for simple string errors
      }

      setStatusMessage({ type: 'error', message: msg });
      // Don't reset form on error so user can correct input
      resetCreateMutationState(); // Reset specific mutation states
      resetUpdateMutationState();
      resetDeleteMutationState();
      timer = setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000); // Longer display for errors
    }

    return () => clearTimeout(timer);
  }, [
    createSuccess, createError, createErrorData, resetCreateMutationState,
    updateSuccess, updateError, updateErrorData, resetUpdateMutationState,
    deleteSuccess, deleteError, deleteErrorData, resetDeleteMutationState,
    reset, setIsEditing, setEditingId, setShowConfirmDelete, setCategoryToDelete
  ]);

  // Debug log for categories data structure (optional, remove after verification)
  useEffect(() => {
    if (categoriesData) {
      console.log('Categories data received:', categoriesData);
      console.log('Extracted categories array:', categories);
    }
  }, [categoriesData, categories]);


  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form Submission Handler (Create or Update)
  const onSubmit = async (data) => {
    setStatusMessage({ type: '', message: '' }); // Clear messages on new submission
    try {
      if (isEditing && editingId) {
        await updateCategory({ id: editingId, ...data }).unwrap();
      } else {
        await createCategory(data).unwrap();
      }
    } catch (err) {
      // Errors are handled by the useEffect above
      console.error("Submission failed:", err);
    }
  };

  // Reset form to default (for cancel or after successful add/update)
  const resetForm = () => {
    reset({
      name: '',
      description: '',
      active: true
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Load category data into form for editing
  const handleEdit = (category) => {
    setValue('name', category.name);
    setValue('description', category.description);
    setValue('active', category.active);
    setIsEditing(true);
    setEditingId(category._id); // Use _id for editing
  };

  // Prepare for deletion confirmation modal
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowConfirmDelete(true);
  };

  // Execute deletion
  const confirmDelete = async () => {
    if (categoryToDelete) {
      setStatusMessage({ type: '', message: '' }); // Clear messages before action
      try {
        await deleteCategory(categoryToDelete._id).unwrap(); // Use _id for deletion
      } catch (err) {
        // Errors are handled by the useEffect above
        console.error('Deletion failed:', err);
      }
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setCategoryToDelete(null);
  };

  // Toggle category active status
  const toggleStatus = async (id, currentStatus) => {
    setStatusMessage({ type: '', message: '' }); // Clear messages before action
    try {
      await updateCategory({ id, active: !currentStatus }).unwrap();
    } catch (err) {
      // Errors are handled by the useEffect above
      console.error('Toggle status failed:', err);
    }
  };

  // Add scrollbar hiding CSS (can be moved to global CSS)
  const scrollbarHideStyles = `
    .hide-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;     /* Firefox */
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;             /* Chrome, Safari and Opera */
    }
  `;

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Add the scrollbar hiding styles */}
      <style>{scrollbarHideStyles}</style>
      {/* Header */}
      <div className="bg-white/90 rounded-xl shadow-md overflow-hidden backdrop-blur-md">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-3xl font-extrabold text-black mb-2">
              Category <span className="bg-clip-text text-transparent bg-gradient-to-r from-softOrange to-vibrantOrange">Management</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Add, view, edit, and manage your product categories efficiently.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-softOrange via-vibrantOrange to-softOrange mt-4 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage.message && (
        <div className={`rounded-md p-4 mb-4 flex items-center shadow-sm ${
            statusMessage.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-600'
              : 'bg-red-500/10 border border-red-500/30 text-red-600'
          }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusMessage.type === 'success' ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 14l2-2m0 0l2-2m-2 2L10 6m2 6l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} />
          </svg>
          <span className="font-medium">{statusMessage.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Form */}
        <div className="col-span-1">
          <div className="bg-white/90 rounded-xl shadow-md p-6 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-black mb-4">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-black">
                    Category Name
                  </label>
                  <input
                    id="name"
                    {...register('name', { required: 'Category name is required' })}
                    className="mt-1 block w-full rounded-md bg-softOrange/40 border border-softOrange focus:border-vibrantOrange focus:ring focus:ring-vibrantOrange/20 focus:ring-opacity-50 text-black py-2 px-3"
                    placeholder="Enter category name"
                    disabled={isProcessing}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-black">
                    Description
                  </label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={3}
                    className="mt-1 block w-full rounded-md bg-softOrange/40 border border-softOrange focus:border-vibrantOrange focus:ring focus:ring-vibrantOrange/20 focus:ring-opacity-50 text-black py-2 px-3 resize-none hide-scrollbar"
                    placeholder="Enter category description"
                    disabled={isProcessing}
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    id="active"
                    type="checkbox"
                    {...register('active')}
                    className="h-4 w-4 text-vibrantOrange focus:ring-vibrantOrange/30 border-softOrange rounded bg-softOrange/40"
                    disabled={isProcessing}
                  />
                  <label htmlFor="active" className="ml-2 block text-sm font-medium text-black">
                    Active
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-900 rounded-md transition-colors flex items-center"
                    disabled={isProcessing}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-vibrantOrange to-softOrange hover:from-softOrange hover:to-vibrantOrange rounded-md transition-colors flex items-center"
                    disabled={isProcessing}
                  >
                    {isProcessing && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isEditing ? 'Update Category' : 'Add Category'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white/90 rounded-xl shadow-md p-6 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-black">
                Categories
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-md bg-softOrange/40 border border-softOrange focus:border-vibrantOrange focus:ring focus:ring-vibrantOrange/20 focus:ring-opacity-50 text-black py-2 pl-10 pr-3 w-48 sm:w-64"
                  placeholder="Search categories"
                />
                <div className="absolute left-3 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {areCategoriesLoading && categories.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <svg className="animate-spin h-8 w-8 text-vibrantOrange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-vibrantOrange ml-2">Loading categories...</span>
              </div>
            ) : categoriesFetchError ? (
              <div className="bg-red-500/10 text-red-600 border border-red-500/30 rounded-lg p-4">
                Error loading categories: {categoriesErrorDetails?.data?.message || categoriesErrorDetails?.error || 'Unknown error'}. <button onClick={refetchCategories} className="ml-2 underline">Try again</button>
              </div>
            ) : filteredCategories.length > 0 ? (
              <div className="overflow-x-auto hide-scrollbar">
                <table className="min-w-full divide-y divide-softOrange/40">
                  <thead className="bg-softOrange/40">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-8 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                        Products
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-softOrange/40">
                    {filteredCategories.map((category) => (
                      <tr key={category._id} className="hover:bg-softOrange/20 transition-colors">
                        <td className="px-6 py-4 whitespace-normal break-words">
                          <div className="text-sm font-medium text-black">{category.name}</div>
                          <div className="text-sm text-gray-600">{category.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {/* FIX: Display productCount instead of N/A */}
                          <div className="text-sm text-center  text-gray-600">{category.productCount !== undefined ? category.productCount : 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors
                                ${category.active
                                  ? 'bg-green-500/10 text-green-600 border border-green-500/30'
                                  : 'bg-softOrange/40 text-black border border-softOrange'}`}
                            onClick={() => toggleStatus(category._id, category.active)}
                            disabled={isProcessing}
                          >
                            {category.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-vibrantOrange hover:text-orange-600 mr-3 transition-colors"
                            disabled={isProcessing}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            disabled={isProcessing}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-softOrange/20 rounded-lg p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-vibrantOrange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-4 text-gray-600">No categories found. {searchTerm && 'Try a different search term or'} Add a new category.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white/90 rounded-xl shadow-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-black text-center mb-2">Delete Category</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-black bg-softOrange/40 hover:bg-softOrange rounded-md transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors flex items-center"
                disabled={isProcessing}
              >
                {isProcessing && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryManagement;
