import React, { useState } from 'react';
import { useGetAllUsersAdminQuery } from '../../../../features/RTKQUERY'; // Adjust path if needed

function Customers() {
  // RTK Query hook for fetching customer data
  const {
    data: customersData,
    isLoading: areCustomersLoading,
    isError: customersFetchError,
    error: customersErrorDetails,
    refetch: refetchCustomers // Option to manually refetch customers
  } = useGetAllUsersAdminQuery();

  // Local UI State
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sortField, setSortField] = useState('joinDate'); // Default sort to joinDate (createdAt)
  const [sortDirection, setSortDirection] = useState('desc');

  // Extract customers array from RTK Query response, default to empty array
  const customers = customersData?.users || [];

  // --- DEBUGGING: Log incoming customer data to console ---
  // You can remove this useEffect once you confirm the data
  React.useEffect(() => {
    if (customers.length > 0) {
      console.log("Customers data received:", customers);
      customers.forEach((customer, index) => {
        console.log(`Customer ${index + 1} (${customer.fullName}): createdAt =`, customer.createdAt);
      });
    }
  }, [customers]);
  // --- END DEBUGGING ---

  // Unified loading and error states for initial fetch
  const isLoading = areCustomersLoading;
  const mainFetchError = customersFetchError ?
    (customersErrorDetails?.data?.message || customersErrorDetails?.error || 'Failed to load customers from server.') : null;

  // Filter and sort customers based on available schema fields
  const filteredAndSortedCustomers = () => {
    let filtered = customers.filter(customer => {
      const searchLower = search.toLowerCase();
      const customerFullName = customer.fullName?.toLowerCase() || '';
      const customerEmail = customer.email?.toLowerCase() || '';
      const customerPhoneNumber = customer.phoneNumber?.toLowerCase() || '';

      return (
        customerFullName.includes(searchLower) ||
        customerEmail.includes(searchLower) ||
        customerPhoneNumber.includes(searchLower)
      );
    });

    // Sort by selected field (fullName or joinDate using createdAt)
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'fullName') {
        comparison = (a.fullName || '').localeCompare(b.fullName || '');
      } else if (sortField === 'joinDate') {
        // Use `createdAt` directly from Mongoose, provide fallback for invalid/missing dates
        comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const currentCustomers = filteredAndSortedCustomers();

  // Handle sort toggle
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle viewing customer details
  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  // Format date to readable string (using `createdAt` for `joinDate`)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'; // Handle null or undefined dateString
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date'; // Handle invalid date objects
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }; // Added time for more detail
    return date.toLocaleString(undefined, options);
  };

  // WhatsApp Contact Number (PLACEHOLDER - REPLACE WITH YOUR ACTUAL WHATSAPP NUMBER)
  const WHATSAPP_COMPANY_NUMBER = '+1234567890'; // E.g., '+2348012345678' for Nigeria

  // Handle "Contact on WhatsApp" button click
  const handleWhatsappContact = () => {
    const message = encodeURIComponent(`Hello ${selectedCustomer?.fullName || 'customer'}, I'm contacting you from the admin dashboard regarding your account.`);
    // Use the specific customer's phone number if available, otherwise fallback to company number
    const contactNumber = selectedCustomer?.phoneNumber || WHATSAPP_COMPANY_NUMBER;
    window.open(`https://wa.me/${contactNumber}?text=${message}`, '_blank');
  };

  // Calculate total customers metric
  const calculateMetrics = () => {
    return {
      totalCustomers: customers.length,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className='flex flex-col space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Header */}
      <div className="bg-white/90 rounded-xl shadow-md overflow-hidden backdrop-blur-md">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-black mb-2">
                Customer <span className="bg-clip-text text-transparent bg-gradient-to-r from-softOrange to-vibrantOrange">Management</span>
              </h2>
              <p className="text-gray-600 text-lg">
                View and manage your customer base
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-softOrange via-vibrantOrange to-softOrange mt-4 rounded-full"></div>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full lg:w-64 bg-softOrange/40 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange transition duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Metrics (Simplified & Styled) */}
      <div className="grid grid-cols-1"> {/* Changed to 1 column grid */}
        {/* Total Customers */}
        <div className="bg-white/90 rounded-xl shadow-md overflow-hidden p-4 flex items-center justify-between backdrop-blur-md">
          <div>
            <p className="text-gray-600 text-sm mb-1">Total Registered Customers</p>
            <h3 className="text-3xl font-bold text-black">{metrics.totalCustomers}</h3> {/* Larger text */}
          </div>
          <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-500"> {/* Larger icon container with rounded-xl */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"> {/* Larger icon */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter options (Simplified) */}
      <div className="bg-white/90 rounded-xl shadow-md overflow-hidden backdrop-blur-md">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="w-full md:w-1/2">
              <label htmlFor="sortField" className="block text-gray-600 text-sm mb-2">Sort by</label>
              <select
                id="sortField"
                value={sortField}
                onChange={(e) => {
                  setSortField(e.target.value);
                  setSortDirection('desc'); // Reset to default desc for new sort field
                }}
                className="w-full bg-softOrange/40 text-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange"
              >
                <option value="joinDate">Join Date</option>
                <option value="fullName">Customer Name</option>
              </select>
            </div>
            <div className="w-full md:w-1/2">
              <label htmlFor="sortOrder" className="block text-gray-600 text-sm mb-2">Order</label>
              <select
                id="sortOrder"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                className="w-full bg-softOrange/40 text-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Customers list and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer list */}
        <div className={`${selectedCustomer ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-300`}>
          <div className="bg-white/90 rounded-xl shadow-md overflow-hidden backdrop-blur-md">
            <div className="px-6 py-4 border-b border-softOrange/40 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">Customer List</h3>
              <span className="text-gray-600 text-sm">
                {currentCustomers.length} {currentCustomers.length === 1 ? 'customer' : 'customers'} found
              </span>
            </div>
            {isLoading && customers.length === 0 ? (
              <div className="p-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-vibrantOrange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-vibrantOrange">Loading customers...</span>
                </div>
              </div>
            ) : mainFetchError ? (
              <div className="p-8 text-center text-red-600">
                <h2 className="text-xl font-bold mb-2">Error Loading Customers</h2>
                <p className="text-gray-600">Failed to fetch customer data from the server. This could be due to a network issue or server problem.</p>
                <p className="text-sm text-gray-500">Details: {mainFetchError}</p>
                <button onClick={refetchCustomers} className="mt-4 px-4 py-2 bg-vibrantOrange text-white rounded-lg hover:bg-softOrange transition-colors">
                  Retry Fetch
                </button>
              </div>
            ) : (
              <>
                {currentCustomers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-softOrange/40">
                        <tr>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
                            onClick={() => toggleSort('fullName')}
                          >
                            <div className="flex items-center">
                              Customer Name
                              {sortField === 'fullName' && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                </svg>
                              )}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Phone Number</th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
                            onClick={() => toggleSort('joinDate')}
                          >
                            <div className="flex items-center">
                              Joined Date
                              {sortField === 'joinDate' && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                </svg>
                              )}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-softOrange/40">
                        {currentCustomers.map((customer, index) => (
                          <tr key={customer._id} className={index % 2 === 0 ? 'bg-softOrange/10' : 'bg-white/60'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-black">{customer.fullName || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {customer.email || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {customer.phoneNumber || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {formatDate(customer.createdAt)} {/* Use createdAt from schema */}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => viewCustomerDetails(customer)}
                                className="text-vibrantOrange hover:text-orange-600 transition duration-150"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-vibrantOrange mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-vibrantOrange text-lg">No customers found</p>
                    <p className="text-gray-600 text-sm mt-1">There are no customers matching your current filters.</p>
                  </div>
                )}
              </>
            )}
            {!isLoading && currentCustomers.length > 0 && (
              <div className="px-6 py-4 bg-softOrange/10 border-t border-softOrange/40">
                <p className="text-sm text-gray-600">
                  Showing {currentCustomers.length} {currentCustomers.length === 1 ? 'customer' : 'customers'}
                  {search ? ` matching "${search}"` : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Customer details */}
        {selectedCustomer && (
          <div className="lg:col-span-1 transition-all duration-300">
            <div className="bg-white/90 rounded-xl shadow-md overflow-hidden sticky top-6 backdrop-blur-md">
              <div className="px-6 py-4 border-b border-softOrange/40 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-black">Customer Details</h3>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-600 hover:text-black transition duration-150"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <h4 className="text-xl font-semibold text-black">{selectedCustomer.fullName || 'N/A'}</h4>
                  <p className="text-gray-600 mt-1">{selectedCustomer.email || 'N/A'}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-black">{selectedCustomer.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-black">Joined: {formatDate(selectedCustomer.createdAt)}</span> {/* Use createdAt */}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleWhatsappContact}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-softOrange via-vibrantOrange to-softOrange hover:from-vibrantOrange hover:to-softOrange text-white font-medium rounded-lg transition duration-300 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact on WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Customers;
