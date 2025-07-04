import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
// import authService from '../firebase/AuthService';
import { useForm, Controller } from 'react-hook-form';
// import userService from '../firebase/UserService';
import { setCredentials, selectCurrentUser } from '../features/authSlice';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const user = useSelector(selectCurrentUser);
  
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [selectedFavorites, setSelectedFavorites] = useState([]);
  
  // Initialize userData state with default values
  const [userData, setUserData] = useState({
    displayName: 'Guest User',
    email: 'guest@example.com',
    photoURL: null,
    phoneNumber: '',
    addresses: [],
    dateJoined: new Date().toISOString(),
    bio: '',
    favorite: [],
    preferences: {
      notifications: true,
      marketingEmails: false,
      twoFactorAuth: true,
      spiceLevel: '3'
    }
  });
  
  // Initialize React Hook Form
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      displayName: userData.displayName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      currentAddress: '',
      bio: userData.bio,
      favorite: userData.favorite,
      preferences: userData.preferences
    }
  });
  
  // Update form defaults when userData changes
  useEffect(() => {
    if (userData) {
      reset({
        displayName: userData.displayName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        currentAddress: '',
        bio: userData.bio,
        favorite: userData.favorite,
        preferences: userData.preferences
      });
    }
  }, [userData, reset]);

  useEffect(() => {
    if (user) {
      setUserData({
        displayName: user.displayName || 'Ramen Lover',
        email: user.email || 'user@example.com',
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber || '',
        addresses: user.addresses || [],
        dateJoined: user.createdAt || new Date().toISOString(),
        bio: user.bio || '',
        favorite: user.favorite || [],
        preferences: {
          notifications: user.preferences?.notifications ?? true,
          marketingEmails: user.preferences?.marketingEmails ?? false,
          twoFactorAuth: user.preferences?.twoFactorAuth ?? true,
          spiceLevel: user.preferences?.spiceLevel || '3'
        },
        uid: user.uid,
        emailVerified: user.emailVerified,
        ...Object.keys(user)
          .filter(key => !['displayName', 'email', 'photoURL', 'phoneNumber', 'addresses', 
                          'createdAt', 'bio', 'favorite', 'preferences', 'uid', 
                          'emailVerified'].includes(key))
          .reduce((obj, key) => {
            obj[key] = user[key];
            return obj;
          }, {})
      });
      
      setSelectedFavorites(user.favorite || []);
    }
  }, [user]);
  
  const handlePreferenceToggle = (preference) => {
    const currentPreferences = watch('preferences');
    setValue('preferences', {
      ...currentPreferences,
      [preference]: !currentPreferences[preference]
    });
  };

  const handleFavoriteToggle = (ramenType) => {
    const updatedFavorites = selectedFavorites.includes(ramenType)
      ? selectedFavorites.filter(item => item !== ramenType)
      : [...selectedFavorites, ramenType];
    
    setSelectedFavorites(updatedFavorites);
    setValue('favorite', updatedFavorites);
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }
    
    if (!file.type.match('image.*')) {
      alert("Only image files are allowed.");
      return;
    }
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const uploadImageToServer = async () => {
    if (!imageFile) return null;
    setIsUploading(true);
    try {
      // Replace with your backend upload logic
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(imagePreview);
        }, 1000);
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const onSubmit = async (formData) => {
    try {
      setIsUploading(true);
      let photoURL = userData.photoURL;
      
      if (imageFile) {
        const uploadedImageUrl = await uploadImageToServer();
        if (uploadedImageUrl) {
          photoURL = uploadedImageUrl;
        }
      }
      
      const updatedData = { 
        ...formData, 
        photoURL,
        addresses: userData.addresses,
        favorite: selectedFavorites
      };
      
      if (user?.id) {
        // Replace with your backend update logic
        setUserData({ ...userData, ...updatedData });
        dispatch(setCredentials({ user: { ...userData, ...updatedData }, token: user.token }));
        alert("Profile updated successfully!");
      } else {
        throw new Error("User ID not found.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsUploading(false);
      setImageFile(null);
      setImagePreview(null);
      setIsEditing(false);
    }
  };
  
  const handleCancel = () => {
    reset({
      displayName: userData.displayName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      currentAddress: '',
      bio: userData.bio,
      favorite: userData.favorite,
      preferences: userData.preferences
    });
    setSelectedFavorites(userData.favorite || []);
    setImagePreview(null);
    setImageFile(null);
    setIsEditing(false);
  };
  
  const handleAddAddress = () => {
    const currentAddress = watch('currentAddress');
    if (currentAddress && !userData.addresses.includes(currentAddress)) {
      const newAddresses = [...userData.addresses, currentAddress];
      setUserData({ ...userData, addresses: newAddresses });
      setValue('currentAddress', '');
    }
  };
  
  const handleRemoveAddress = (indexToRemove) => {
    const newAddresses = userData.addresses.filter((_, index) => index !== indexToRemove);
    setUserData({ ...userData, addresses: newAddresses });
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Define available ramen types
  const ramenTypes = [
    { id: 'tonkotsu', name: 'Tonkotsu (Pork Bone Broth)' },
    { id: 'shoyu', name: 'Shoyu (Soy Sauce Based)' },
    { id: 'miso', name: 'Miso (Fermented Soybean)' },
    { id: 'shio', name: 'Shio (Salt Based)' },
    { id: 'tantanmen', name: 'Tantanmen (Spicy Sesame)' },
    { id: 'tsukemen', name: 'Tsukemen (Dipping Ramen)' },
  ];

  // Modified profile tab section
  const renderFavoriteRamenSection = () => (
    <div>
      <label className="block text-gray-400 mb-2 font-medium">Favorite Ramen Styles</label>
      {isEditing ? (
        <div className="space-y-2">
          {ramenTypes.map((ramen) => (
            <div key={ramen.id} className="flex items-center">
              <input
                type="checkbox"
                id={`ramen-${ramen.id}`}
                checked={selectedFavorites.includes(ramen.id)}
                onChange={() => handleFavoriteToggle(ramen.id)}
                className="w-4 h-4 mr-3 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
              />
              <label htmlFor={`ramen-${ramen.id}`} className="text-gray-300">
                {ramen.name}
              </label>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-white bg-gray-700/50 px-4 py-3 rounded-lg">
          {userData.favorite && userData.favorite.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userData.favorite.map(favoriteId => {
                const ramen = ramenTypes.find(r => r.id === favoriteId);
                return ramen ? (
                  <span 
                    key={ramen.id} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400"
                  >
                    <span className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></span>
                    {ramen.name}
                  </span>
                ) : null;
              })}
            </div>
          ) : (
            "No favorites selected yet."
          )}
        </div>
      )}
    </div>
  );

  if (!user && !user?.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Not Signed In</h2>
          <p className="text-gray-300 mb-6">You need to sign in to view your profile.</p>
          <div className="flex space-x-4 justify-center">
            <Link to="/signin" className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-medium rounded-lg transition-colors">
              Sign In
            </Link>
            <Link to="/auth/signup" className="px-6 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // In your render method, replace the favoriteRamen select dropdown with the new multi-select component
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6">
      {/* Header with logo */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 flex items-center justify-center text-white font-bold text-xl">R</div>
            <span className="ml-2 text-white text-lg font-medium">Ramen Paradise</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link to="/orders" className="text-gray-300 hover:text-white transition-colors">
              Orders
            </Link>
            <Link to="/cart" className="text-gray-300 hover:text-white transition-colors">
              Cart
            </Link>
          </div>
        </div>
      </div>
      
      <form onSubmit={isEditing ? handleSubmit(onSubmit) : undefined} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  User <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">Profile</span>
                </h2>
                <p className="text-gray-400">
                  View and manage your personal information
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mt-4"></div>
              </div>
              
              <div className="mt-4 md:mt-0">
                {!isEditing ? (
                  <button 
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-medium rounded-lg transition duration-300 transform hover:-translate-y-1 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button 
                      type="submit"
                      disabled={isUploading}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition duration-300 flex items-center"
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save
                        </>
                      )}
                    </button>
                    <button 
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition duration-300 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card - Left Column */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="p-6 flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700">
                  {(imagePreview || userData.photoURL) ? (
                    <img 
                      src={imagePreview || userData.photoURL} 
                      alt={userData.displayName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-yellow-400 bg-gray-700">
                      {userData.displayName?.charAt(0).toUpperCase() || 'R'}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-yellow-500 hover:bg-yellow-600 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                )}
              </div>
              
              <h3 className="mt-4 text-xl font-bold text-white">{userData.displayName}</h3>
              <span className="px-3 py-1 mt-2 bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-full text-yellow-400 text-sm font-medium">
                Ramen Enthusiast
              </span>
              
              <div className="mt-6 w-full space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-yellow-400 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {isLoadingEmail ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-gray-300">Loading email...</span>
                    </div>
                  ) : (
                    <p className="text-gray-300">{userData.email}</p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-yellow-400 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  {isEditing ? (
                    <Controller
                      name="phoneNumber"
                      control={control}
                      render={({ field }) => (
                        <input 
                          type="tel" 
                          {...field}
                          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      )}
                    />
                  ) : (
                    <p className="text-gray-300">{userData.phoneNumber || 'No phone number'}</p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-yellow-400 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-300">Joined: {formatDate(userData.dateJoined)}</p>
                </div>
              </div>
              
              {!isEditing && (
                <div className="mt-8 w-full">
                  <div className="flex justify-between space-x-2">
                    <button 
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'profile' 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-red-500/20 text-yellow-400' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Profile
                    </button>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('addresses')}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'addresses' 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-red-500/20 text-yellow-400' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Addresses
                    </button>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('preferences')}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'preferences' 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-red-500/20 text-yellow-400' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Info - Middle and Right Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Information Tab */}
            {(isEditing || activeTab === 'profile') && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 mb-2 font-medium">Full Name</label>
                      {isEditing ? (
                        <Controller
                          name="displayName"
                          control={control}
                          rules={{ required: "Name is required" }}
                          render={({ field }) => (
                            <div>
                              <input 
                                {...field}
                                type="text" 
                                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              />
                              {errors.displayName && (
                                <p className="mt-1 text-red-500 text-sm">{errors.displayName.message}</p>
                              )}
                            </div>
                          )}
                        />
                      ) : (
                        <p className="text-white bg-gray-700/50 px-4 py-3 rounded-lg">{userData.displayName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 mb-2 font-medium">Email</label>
                      <p className="text-white bg-gray-700/50 px-4 py-3 rounded-lg">
                        {isLoadingEmail ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                            <span>Loading email...</span>
                          </div>
                        ) : userData.email}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">Your email cannot be changed.</p>
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 mb-2 font-medium">Bio</label>
                      {isEditing ? (
                        <Controller
                          name="bio"
                          control={control}
                          render={({ field }) => (
                            <textarea 
                              {...field}
                              rows="4" 
                              placeholder="Tell us a bit about yourself and your ramen preferences..."
                              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            ></textarea>
                          )}
                        />
                      ) : (
                        <p className="text-white bg-gray-700/50 px-4 py-3 rounded-lg min-h-[80px]">
                          {userData.bio || "No bio provided yet."}
                        </p>
                      )}
                    </div>
                    
                    {/* Replace the old favoriteRamen selector with the new multi-select component */}
                    {renderFavoriteRamenSection()}
                  </div>
                </div>
              </div>
            )}
            
            {/* Addresses Tab */}
            {(!isEditing && activeTab === 'addresses' || isEditing) && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Delivery Addresses</h3>
                </div>
                <div className="p-6">
                  {isEditing && (
                    <div className="mb-6">
                      <label className="block text-gray-400 mb-2 font-medium">Add New Address</label>
                      <div className="flex">
                        <Controller
                          name="currentAddress"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="Enter your delivery address"
                              className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                          )}
                        />
                        <button
                          type="button"
                          onClick={handleAddAddress}
                          className="px-4 py-3 bg-gradient-to-r from-yellow-500 to-red-500 text-white rounded-r-lg hover:from-yellow-600 hover:to-red-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {userData.addresses.length > 0 ? (
                    <div className="space-y-3">
                      {userData.addresses.map((address, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-yellow-400 mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-white">{address}</p>
                              {index === 0 && (
                                <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full mt-1 inline-block">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          {isEditing && (
                            <button 
                              type="button"
                              onClick={() => handleRemoveAddress(index)}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="text-lg font-medium text-white mb-2">No addresses yet</h3>
                      <p className="text-gray-400 mb-5">You haven't added any delivery addresses.</p>
                      {!isEditing && (
                        <button 
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-medium rounded-lg transition-colors"
                        >
                          Add Address
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Preferences Tab */}
            {(!isEditing && activeTab === 'preferences' || isEditing) && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Preferences</h3>
                </div>
                <div className="p-6">
                  {/* Preferences content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Email Notifications</h4>
                        <p className="text-gray-400 text-sm">Receive notifications about orders and updates</p>
                      </div>
                      {isEditing ? (
                        <div 
                          onClick={() => handlePreferenceToggle('notifications')} 
                          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                            watch('preferences.notifications') ? 'bg-yellow-500' : 'bg-gray-600'
                          }`}
                        >
                          <span 
                            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${
                              watch('preferences.notifications') ? 'translate-x-6' : ''
                            }`}
                          />
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          userData.preferences.notifications 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {userData.preferences.notifications ? 'Enabled' : 'Disabled'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Marketing Emails</h4>
                        <p className="text-gray-400 text-sm">Receive promotional emails and special offers</p>
                      </div>
                      {isEditing ? (
                        <div 
                          onClick={() => handlePreferenceToggle('marketingEmails')} 
                          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                            watch('preferences.marketingEmails') ? 'bg-yellow-500' : 'bg-gray-600'
                          }`}
                        >
                          <span 
                            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${
                              watch('preferences.marketingEmails') ? 'translate-x-6' : ''
                            }`}
                          />
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          userData.preferences.marketingEmails 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {userData.preferences.marketingEmails ? 'Enabled' : 'Disabled'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                        <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                      </div>
                      {isEditing ? (
                        <div 
                          onClick={() => handlePreferenceToggle('twoFactorAuth')} 
                          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                            watch('preferences.twoFactorAuth') ? 'bg-yellow-500' : 'bg-gray-600'
                          }`}
                        >
                          <span 
                            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${
                              watch('preferences.twoFactorAuth') ? 'translate-x-6' : ''
                            }`}
                          />
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          userData.preferences.twoFactorAuth 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {userData.preferences.twoFactorAuth ? 'Enabled' : 'Disabled'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <h4 className="text-white font-medium mb-4">Spice Level Preference</h4>
                    <div className="flex items-center justify-between">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <label key={level} className="flex flex-col items-center cursor-pointer group">
                          <Controller
                            name="preferences.spiceLevel"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="radio"
                                className="sr-only"
                                value={level.toString()}
                                checked={field.value === level.toString()}
                                onChange={() => isEditing && setValue('preferences.spiceLevel', level.toString())}
                                disabled={!isEditing}
                              />
                            )}
                          />
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            watch('preferences.spiceLevel') === level.toString() 
                              ? 'bg-gradient-to-br from-yellow-500 to-red-600 text-white transform scale-110' 
                              : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600'
                          } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}>
                            {level}
                          </div>
                          <span className="mt-1 text-xs font-medium text-gray-400">
                            {level === 1 && 'Mild'}
                            {level === 2 && 'Medium'}
                            {level === 3 && 'Spicy'}
                            {level === 4 && 'Very Hot'}
                            {level === 5 && 'Extreme'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}