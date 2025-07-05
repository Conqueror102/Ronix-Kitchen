import React, { useState, useEffect } from 'react';
import {
  useGetAllOrdersAdminQuery,
  useUpdateOrderMutation,
} from '../../../../features/RTKQUERY'; // Adjust path if needed

function Orders() {
  // RTK Query hooks for order data and mutations
  const {
    data: ordersData,
    isLoading: areOrdersLoading,
    isError: ordersFetchError,
    error: ordersErrorDetails,
    refetch: refetchOrders // Option to manually refetch orders
  } = useGetAllOrdersAdminQuery(); // Fetch all orders using RTK Query

  const [
    updateOrder,
    {
      isLoading: isUpdatingOrder,
      isSuccess: updateOrderSuccess,
      isError: updateOrderError,
      error: updateOrderErrorData,
      reset: resetUpdateOrderMutationState
    }
  ] = useUpdateOrderMutation();

  // Local UI State (filters, selected order, messages)
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' }); // Unified status message

  // Derived state: Extract orders array from RTK Query response
  // If ordersData is null/undefined, default to an empty array
  const orders = ordersData?.orders || [];

  // Unified loading state
  const isLoading = areOrdersLoading || isUpdatingOrder;

  // Unified error state for initial fetch
  const mainFetchError = ordersFetchError ?
    (ordersErrorDetails?.data?.message || ordersErrorDetails?.error || 'Failed to load orders.') : null;


  // Effect to handle success/error messages from updateOrder mutation
  useEffect(() => {
    let timer;
    if (updateOrderSuccess) {
      setStatusMessage({ type: 'success', message: `Successfully updated order status.` });
      resetUpdateOrderMutationState();
      timer = setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
    } else if (updateOrderError) {
      console.error('Error updating order status:', updateOrderErrorData);
      let msg = 'Failed to update order status. Please try again.';
      if (updateOrderErrorData) {
        if (typeof updateOrderErrorData.data === 'string' && updateOrderErrorData.data.startsWith('<!DOCTYPE html>')) {
          msg = `Server error during update (Status: ${updateOrderErrorData.originalStatus || 'Unknown'}). Please check backend logs.`;
        } else if (updateOrderErrorData.data?.message) {
          msg = `Failed to update: ${updateOrderErrorData.data.message}`;
        } else if (updateOrderErrorData.error) {
          msg = `Update error: ${updateOrderErrorData.error}`;
        }
      }
      setStatusMessage({ type: 'error', message: msg });
      resetUpdateOrderMutationState();
      timer = setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000);
    }
    return () => clearTimeout(timer);
  }, [updateOrderSuccess, updateOrderError, updateOrderErrorData, resetUpdateOrderMutationState]);


  // Filter orders based on status, date, and search term
  const filteredOrders = orders.filter(order => {
    // Apply status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

      if (dateFilter === 'today') {
        return orderDate.toDateString() === new Date().toDateString(); // Compare date strings for simplicity
      } else if (dateFilter === 'week') {
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday
        return orderDate >= firstDayOfWeek;
      } else if (dateFilter === 'month') {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return orderDate >= firstDayOfMonth;
      }
    }

    // Apply search filter (case-insensitive)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      // Safely access properties for search
      const customerName = order.customer?.name?.toLowerCase() || '';
      const customerEmail = order.customer?.email?.toLowerCase() || '';
      const orderId = order._id?.toLowerCase() || ''; // Use _id from MongoDB

      return (
        orderId.includes(searchLower) ||
        customerName.includes(searchLower) ||
        customerEmail.includes(searchLower)
      );
    }

    return true;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleString(undefined, options);
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'processing':
        return 'bg-blue-500/10 text-blue-600';
      case 'delivered':
        return 'bg-green-500/10 text-green-600';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-softOrange/40 text-black';
    }
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  // Update order status using RTK Query mutation
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Call the mutation, sending the order ID and new status
      await updateOrder({ id: orderId, status: newStatus }).unwrap();
    } catch (err) {
      // Error handling is managed by the useEffect hook
      console.error("Failed to update order status:", err);
    }
  };

  // Calculate totals for stats cards
  const calculateTotals = () => {
    return {
      totalOrders: orders.length, // Use raw orders length for overall total
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      revenue: orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.total || 0), 0) // Ensure total is a number
    };
  };

  const totals = calculateTotals();

  return (
    <div className='flex flex-col space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Header */}
      <div className="bg-white/90 rounded-xl shadow-md overflow-hidden backdrop-blur-md">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-black mb-2">
                Order <span className="bg-clip-text text-transparent bg-gradient-to-r from-softOrange to-vibrantOrange">Management</span>
              </h2>
              <p className="text-gray-600 text-lg">
                Track and manage customer orders efficiently
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-softOrange via-vibrantOrange to-softOrange mt-4 rounded-full"></div>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full lg:w-60 bg-softOrange/40 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange transition duration-200"
                />
              </div>
              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-softOrange/40 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 bg-softOrange/40 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrantOrange"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message Display */}
      {statusMessage.message && (
        <div className={`px-4 py-3 rounded-lg flex items-center shadow-sm ${statusMessage.type === 'success' ? 'bg-green-500/10 border border-green-500 text-green-600' : 'bg-red-500/10 border border-red-500 text-red-600'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusMessage.type === 'success' ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 14l2-2m0 0l2-2m-2 2L10 6m2 6l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} />
          </svg>
          <span>{statusMessage.message}</span>
        </div>
      )}

      {/* Order Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Orders */}
        <div className="bg-white/90 rounded-xl shadow-md overflow-hidden p-4 flex items-center justify-between backdrop-blur-md">
          <div>
            <p className="text-gray-600 text-sm">Total Orders</p>
            <h3 className="text-2xl font-bold text-black">{totals.totalOrders}</h3>
          </div>
          <div className="h-10 w-10 bg-vibrantOrange/10 rounded-lg flex items-center justify-center text-vibrantOrange">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        {/* Pending Orders */}
        <div className="bg-white/90 rounded-xl shadow-md overflow-hidden p-4 flex items-center justify-between backdrop-blur-md">
          <div>
            <p className="text-gray-600 text-sm">Pending</p>
            <h3 className="text-2xl font-bold text-yellow-600">{totals.pending}</h3>
          </div>
          <div className="h-10 w-10 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        {/* Processing Orders */}
        <div className="bg-white/90 rounded-xl shadow-md overflow-hidden p-4 flex items-center justify-between backdrop-blur-md">
          <div>
            <p className="text-gray-600 text-sm">Processing</p>
            <h3 className="text-2xl font-bold text-blue-600">{totals.processing}</h3>
          </div>
          <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>
        {/* Delivered Orders */}
        <div className="bg-white/90 rounded-xl shadow-md overflow-hidden p-4 flex items-center justify-between backdrop-blur-md">
          <div>
            <p className="text-gray-600 text-sm">Delivered</p>
            <h3 className="text-2xl font-bold text-green-600">{totals.delivered}</h3>
          </div>
          <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        {/* Total Revenue */}
        <div className="bg-white/90 rounded-xl shadow-md overflow-hidden p-4 flex items-center justify-between backdrop-blur-md">
          <div>
            <p className="text-gray-600 text-sm">Revenue</p>
            <h3 className="text-2xl font-bold text-green-600">{formatCurrency(totals.revenue)}</h3>
          </div>
          <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Orders Table and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Table */}
        <div className={`${selectedOrder ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-300`}>
          <div className="bg-white/90 rounded-xl shadow-md overflow-hidden backdrop-blur-md">
            <div className="px-6 py-4 border-b border-softOrange/40 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">Orders List</h3>
              <span className="text-gray-600 text-sm">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
              </span>
            </div>
            {isLoading && orders.length === 0 ? (
              <div className="p-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-vibrantOrange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-vibrantOrange">Loading orders...</span>
                </div>
              </div>
            ) : mainFetchError ? (
              <div className="p-8 text-center text-red-600">
                <h2 className="text-xl font-bold mb-2">Error Loading Orders</h2>
                <p className="text-gray-600">Failed to fetch orders from the server. This could be due to a network issue or server problem.</p>
                <p className="text-sm text-gray-500">Details: {mainFetchError}</p>
                <button onClick={refetchOrders} className="mt-4 px-4 py-2 bg-vibrantOrange text-white rounded-lg hover:bg-softOrange transition-colors">
                  Retry Fetch
                </button>
              </div>
            ) : (
              <>
                {filteredOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-softOrange/40">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-softOrange/40">
                        {filteredOrders.map((order, index) => (
                          <tr key={order._id || order.id} className={index % 2 === 0 ? 'bg-softOrange/10' : 'bg-white/60'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                              {order._id || order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full flex-shrink-0 overflow-hidden">
                                  <img
                                    src={order.customer?.avatar || 'https://placehold.co/32x32/F7F7F7/AAAAAA?text=User'}
                                    alt={order.customer?.name || 'Customer'}
                                    className="h-8 w-8 object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/32x32/F7F7F7/AAAAAA?text=User'; }}
                                  />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-black">{order.customer?.name || 'N/A'}</div>
                                  <div className="text-sm text-gray-600">{order.customer?.email || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {formatDate(order.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {formatCurrency(order.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)} capitalize`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => viewOrderDetails(order)}
                                className="text-vibrantOrange hover:text-orange-600 transition duration-150 mr-4"
                              >
                                View
                              </button>
                              <div className="relative inline-block text-left">
                                <select
                                  className="bg-softOrange/40 text-black text-xs rounded-lg py-1 px-2 border border-softOrange focus:outline-none focus:ring-1 focus:ring-vibrantOrange"
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order._id || order.id, e.target.value)}
                                  disabled={isUpdatingOrder}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-vibrantOrange mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <p className="text-vibrantOrange text-lg">No orders found</p>
                    <p className="text-gray-600 text-sm mt-1">There are no orders matching your current filters.</p>
                  </div>
                )}
              </>
            )}
            {!isLoading && filteredOrders.length > 0 && (
              <div className="px-6 py-4 bg-softOrange/10 border-t border-softOrange/40">
                <p className="text-sm text-gray-600">
                  Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                  {statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}
                  {dateFilter !== 'all' ? ` from ${dateFilter === 'today' ? 'today' : dateFilter === 'week' ? 'this week' : 'this month'}` : ''}
                  {searchTerm ? ` matching "${searchTerm}"` : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        {selectedOrder && (
          <div className="lg:col-span-1 transition-all duration-300">
            <div className="bg-white/90 rounded-xl shadow-md overflow-hidden sticky top-6 backdrop-blur-md">
              <div className="px-6 py-4 border-b border-softOrange/40 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-black">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-600 hover:text-black transition duration-150"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xl font-semibold text-black">{selectedOrder._id || selectedOrder.id}</h4>
                    <p className="text-gray-600 mt-1">{formatDate(selectedOrder.date)}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedOrder.status)} capitalize`}>
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">CUSTOMER INFO</h5>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img
                        src={selectedOrder.customer?.avatar || 'https://placehold.co/40x40/F7F7F7/AAAAAA?text=User'}
                        alt={selectedOrder.customer?.name || 'Customer'}
                        className="h-10 w-10 object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40x40/F7F7F7/AAAAAA?text=User'; }}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-black font-medium">{selectedOrder.customer?.name || 'N/A'}</p>
                      <p className="text-gray-600 text-sm">{selectedOrder.customer?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mt-2">{selectedOrder.customer?.phone || 'N/A'}</p>
                </div>

                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">DELIVERY ADDRESS</h5>
                  <p className="text-gray-700 text-sm">{selectedOrder.deliveryAddress || 'N/A'}</p>
                </div>

                {selectedOrder.notes && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">ORDER NOTES</h5>
                    <p className="text-gray-700 text-sm">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">PAYMENT METHOD</h5>
                  <p className="text-gray-700 text-sm">{selectedOrder.paymentMethod || 'N/A'}</p>
                </div>

                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">ORDER ITEMS</h5>
                  <div className="bg-softOrange/20 rounded-lg overflow-hidden">
                    <div className="divide-y divide-softOrange/40">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item) => (
                          <div key={item._id || item.id} className="p-3 flex justify-between">
                            <div>
                              <p className="text-black text-sm font-medium">{item.product?.productName || item.name || 'N/A'}</p>
                              <p className="text-gray-600 text-xs mt-1">Qty: {item.quantity || 0}</p>
                            </div>
                            <p className="text-gray-700 text-sm">
                              {formatCurrency((item.price || 0) * (item.quantity || 0))}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-gray-600 text-sm">No items in this order.</div>
                      )}
                    </div>
                    <div className="p-3 border-t border-softOrange/40 flex justify-between">
                      <p className="text-black font-medium">Total</p>
                      <p className="text-black font-medium">{formatCurrency(selectedOrder.total)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-softOrange to-vibrantOrange hover:from-vibrantOrange hover:to-softOrange text-white font-medium rounded-lg transition duration-300 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Receipt
                  </button>
                  <select
                    className="px-4 py-2 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-vibrantOrange"
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder._id || selectedOrder.id, e.target.value)}
                    disabled={isUpdatingOrder}
                  >
                    <option value="pending">Mark as Pending</option>
                    <option value="processing">Mark as Processing</option>
                    <option value="delivered">Mark as Delivered</option>
                    <option value="cancelled">Mark as Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
