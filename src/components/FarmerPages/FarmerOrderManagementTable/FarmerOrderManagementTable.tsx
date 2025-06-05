"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, User, Package, ShoppingCart, Calendar, DollarSign, Search, Filter, AlertTriangle, Check, X, Eye } from 'lucide-react';
import axios from 'axios';
import { getWithExpiry } from '../../../../auth-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from "react-toastify";

const OrderNotificationsTable = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        productName: '',
        category: '',
        userType: '',
        customerName: ''
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [profileImages, setProfileImages] = useState({});

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const selectedOrderParam = searchParams.get('selectedOrder');
        if (selectedOrderParam) {
            try {
                const selectedOrder = JSON.parse(decodeURIComponent(selectedOrderParam));
                setOrders([selectedOrder]);
                setFilteredOrders([selectedOrder]);
            } catch (error) {
                console.error('Error parsing selected order:', error);
                fetchOrders();
            }
        } else {
            fetchOrders();
        }
    }, [searchParams]);

    useEffect(() => {
        applyFilters();
    }, [orders, filters]);

    // Fetch profile images for all customers
    useEffect(() => {
        filteredOrders.forEach(order => {
            if (order.rawOrder?.user?.userID && !profileImages[order.rawOrder.user.userID]) {
                fetchFarmerProfileImage(order.rawOrder.user.userID);
            }
        });
    }, [filteredOrders]);

    const fetchFarmerProfileImage = async (userID) => {
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewUserProfile?userID=${userID}`,
                { responseType: "blob" }
            );
            setProfileImages(prev => ({
                ...prev,
                [userID]: URL.createObjectURL(response.data)
            }));
        } catch (error) {
            console.error(`Error fetching profile image for user ${userID}:`, error);
            // Profile image not available, will use default icon
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const userID = getWithExpiry('userID');

            if (!userID) {
                console.error('User ID not found');
                return;
            }

            const apiEndpoints = [
                `http://localhost:8081/api/user/viewConsumerOrdersByFarmerID/${userID}`,
                `http://localhost:8081/api/user/viewSFOrdersByFarmerID/${userID}`,
                `http://localhost:8081/api/user/viewSupermarketOrdersByFarmerID/${userID}`,
                `http://localhost:8081/api/user/viewTrainerOrdersByFarmerID/${userID}`
            ];

            const responses = await Promise.allSettled(
                apiEndpoints.map(url => axios.get(url))
            );

            const allOrders = [];

            responses.forEach((response, index) => {
                if (response.status === 'fulfilled' && response.value.data) {
                    const data = response.value.data;
                    const responseKeys = [
                        'consumerOrderGetResponse',
                        'sfOrderGetResponse',
                        'supermarketOrderGetResponse',
                        'trainerOrderGetResponse'
                    ];
                    const orderTypes = [
                        'Consumer',
                        'Seeds & Fertilizer Seller',
                        'Supermarket',
                        'Trainer'
                    ];
                    const orders = data[responseKeys[index]];

                    if (orders && Array.isArray(orders)) {
                        orders.forEach(order => {
                            const farmerUserID = order.farmerProduct?.user?.userID;

                            if (farmerUserID && farmerUserID.toString() === userID.toString() &&
                                order.active === true &&
                                order.confirmed === false &&
                                order.addedToCart === false &&
                                order.removedFromCart === false &&
                                order.rejected === false &&
                                order.paid === false) {

                                allOrders.push({
                                    id: `${orderTypes[index]}-${order.orderID}`,
                                    orderID: order.orderID,
                                    type: orderTypes[index],
                                    productName: order.productName,
                                    category: order.farmerProduct?.productCategory || order.productCategory || 'N/A',
                                    customerName: `${order.user.firstName} ${order.user.lastName}`,
                                    customerEmail: order.user.userEmail,
                                    quantity: order.requiredQuantity,
                                    price: order.price,
                                    addedDate: new Date(order.addedDate),
                                    description: order.description,
                                    rawOrder: order
                                });
                            }
                        });
                    }
                }
            });

            allOrders.sort((a, b) => b.addedDate - a.addedDate);
            setOrders(allOrders);

        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = orders;

        if (filters.productName) {
            filtered = filtered.filter(order =>
                order.productName.toLowerCase().includes(filters.productName.toLowerCase())
            );
        }

        if (filters.category) {
            filtered = filtered.filter(order =>
                order.category.toLowerCase().includes(filters.category.toLowerCase())
            );
        }

        if (filters.userType) {
            filtered = filtered.filter(order =>
                order.type.toLowerCase().includes(filters.userType.toLowerCase())
            );
        }

        if (filters.customerName) {
            filtered = filtered.filter(order =>
                order.customerName.toLowerCase().includes(filters.customerName.toLowerCase())
            );
        }

        setFilteredOrders(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            productName: '',
            category: '',
            userType: '',
            customerName: ''
        });
        setCurrentPage(1);
        // If a specific order was selected, reset to show all orders
        if (searchParams.get('selectedOrder')) {
            router.push('/farmerViewOrders');
            fetchOrders();
        }
    };

    const handleProfileClick = (order) => {
        if (order.rawOrder && order.rawOrder.user && order.rawOrder.user.userID) {
            router.push(`/farmerViewCustomermerProfile?userID=${order.rawOrder.user.userID}`);
        }
    };

    const handleConfirmOrder = (order) => {
        setSelectedOrder(order);
        setShowConfirmModal(true);
    };

    const handleRejectOrder = (order) => {
        setSelectedOrder(order);
        setShowRejectModal(true);
    };

    const confirmOrder = async () => {
        if (!selectedOrder) return;

        try {
            setActionLoading(true);

            let apiUrl = '';
            switch (selectedOrder.type) {
                case 'Consumer':
                    apiUrl = `http://localhost:8081/api/user/consumer-order-products/${selectedOrder.orderID}/confirm`;
                    break;
                case 'Seeds & Fertilizer Seller':
                    apiUrl = `http://localhost:8081/api/user/sf-order-products/${selectedOrder.orderID}/confirm`;
                    break;
                case 'Supermarket':
                    apiUrl = `http://localhost:8081/api/user/supermarket-order-products/${selectedOrder.orderID}/confirm`;
                    break;
                case 'Trainer':
                    apiUrl = `http://localhost:8081/api/user/trainer-order-products/${selectedOrder.orderID}/confirm`;
                    break;
                default:
                    throw new Error('Invalid order type');
            }

            await axios.put(apiUrl);
            setOrders(prev => prev.filter(order => order.id !== selectedOrder.id));
            toast.success('Order confirmed successfully!');
            // If a specific order was selected, redirect to show all orders
            if (searchParams.get('selectedOrder')) {
                router.push('/farmerViewOrders');
                fetchOrders();
            }

        } catch (error) {
            console.error('Error confirming order:', error);
            toast.error('Failed to confirm order. Please try again.');
        } finally {
            setActionLoading(false);
            setShowConfirmModal(false);
            setSelectedOrder(null);
        }
    };

    const rejectOrder = async () => {
        if (!selectedOrder) return;

        try {
            setActionLoading(true);

            let apiUrl = '';
            switch (selectedOrder.type) {
                case 'Consumer':
                    apiUrl = `http://localhost:8081/api/user/consumer-order-products/${selectedOrder.orderID}/reject`;
                    break;
                case 'Seeds & Fertilizer Seller':
                    apiUrl = `http://localhost:8081/api/user/sf-order-products/${selectedOrder.orderID}/reject`;
                    break;
                case 'Supermarket':
                    apiUrl = `http://localhost:8081/api/user/supermarket-order-products/${selectedOrder.orderID}/reject`;
                    break;
                case 'Trainer':
                    apiUrl = `http://localhost:8081/api/user/trainer-order-products/${selectedOrder.orderID}/reject`;
                    break;
                default:
                    throw new Error('Invalid order type');
            }

            await axios.put(apiUrl);
            setOrders(prev => prev.filter(order => order.id !== selectedOrder.id));
            toast.success('Order rejected successfully!');
            if (searchParams.get('selectedOrder')) {
                router.push('/farmerViewOrders');
                fetchOrders();
            }

        } catch (error) {
            console.error('Error rejecting order:', error);
            toast.error('Failed to reject order. Please try again.');
        } finally {
            setActionLoading(false);
            setShowRejectModal(false);
            setSelectedOrder(null);
        }
    };

    const getTypeIcon = (type) => {
        const iconProps = { size: 18, className: "text-white" };
        switch (type) {
            case 'Consumer': return <User {...iconProps} />;
            case 'Seeds & Fertilizer Seller': return <Package {...iconProps} />;
            case 'Supermarket': return <ShoppingCart {...iconProps} />;
            case 'Trainer': return <User {...iconProps} />;
            default: return <Package {...iconProps} />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Consumer': return 'bg-blue-500';
            case 'Seeds & Fertilizer Seller': return 'bg-green-500';
            case 'Supermarket': return 'bg-purple-500';
            case 'Trainer': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-poppins-bold text-gray-800 mb-2">
                        New Order Notifications
                    </h1>
                    {/*<p className="text-gray-600 font-poppins-regular">*/}
                    {/*    Manage and respond to incoming orders from customers*/}
                    {/*</p>*/}
                </div>

                {/* Filter Section - Fixed */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-poppins-bold text-gray-800 flex items-center">
                            <Filter size={20} className="mr-2 text-[#88C34E]" />
                            Filter Orders
                        </h2>
                        <button
                            onClick={clearFilters}
                            className="text-sm font-poppins-regular text-[#88C34E] hover:text-[#7AB048] transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-poppins-bold text-gray-700 mb-2">
                                Product Name
                            </label>
                            <input
                                type="text"
                                value={filters.productName}
                                onChange={(e) => handleFilterChange('productName', e.target.value)}
                                placeholder="Search by product name..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#88C34E] focus:border-transparent font-poppins-regular"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-poppins-bold text-gray-700 mb-2">
                                Category
                            </label>
                            <input
                                type="text"
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                placeholder="Search by category..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#88C34E] focus:border-transparent font-poppins-regular"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-poppins-bold text-gray-700 mb-2">
                                User Type
                            </label>
                            <select
                                value={filters.userType}
                                onChange={(e) => handleFilterChange('userType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#88C34E] focus:border-transparent font-poppins-regular"
                            >
                                <option value="">All Types</option>
                                <option value="Consumer">Consumer</option>
                                <option value="Seeds & Fertilizer Seller">Seeds & Fertilizer Seller</option>
                                <option value="Supermarket">Supermarket</option>
                                <option value="Trainer">Trainer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-poppins-bold text-gray-700 mb-2">
                                Customer Name
                            </label>
                            <input
                                type="text"
                                value={filters.customerName}
                                onChange={(e) => handleFilterChange('customerName', e.target.value)}
                                placeholder="Search by customer name..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#88C34E] focus:border-transparent font-poppins-regular"
                            />
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header - Fixed */}
                    <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-poppins-bold text-gray-800">
                                Orders ({filteredOrders.length})
                            </h2>
                            <button
                                onClick={fetchOrders}
                                className="px-4 py-2 bg-[#88C34E] text-white rounded-lg hover:bg-[#7AB048] transition-colors font-poppins-regular text-sm"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#88C34E]"></div>
                            <p className="mt-4 text-gray-500 font-poppins-regular">Loading orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package size={32} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-poppins-regular text-lg mb-2">
                                No orders found
                            </p>
                            <p className="text-gray-400 font-poppins-regular text-sm">
                                {orders.length === 0 ? 'No new orders at the moment' : 'Try adjusting your filters'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Scrollable Table */}
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-poppins-bold text-gray-500 uppercase tracking-wider">
                                            Order Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-poppins-bold text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-poppins-bold text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-poppins-bold text-gray-500 uppercase tracking-wider">
                                            Quantity & Price
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-poppins-bold text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-poppins-bold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div
                                                        className="w-10 h-10 rounded-full mr-3 cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-[#88C34E] transition-colors"
                                                        onClick={() => handleProfileClick(order)}
                                                    >
                                                        {profileImages[order.rawOrder?.user?.userID] ? (
                                                            <img
                                                                src={profileImages[order.rawOrder.user.userID]}
                                                                alt="Profile"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                                                                <User size={20} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-poppins-bold text-gray-900">
                                                            Order #{order.orderID}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-poppins-regular">
                                                            {order.type}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">

                                                    <div>
                                                        <div className="text-sm font-poppins-bold text-gray-900">
                                                            {order.customerName}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-poppins-regular">
                                                            {order.customerEmail}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-poppins-bold text-gray-900">
                                                    {order.productName}
                                                </div>
                                                <div className="text-sm text-gray-500 font-poppins-regular">
                                                    Category: {order.category}
                                                </div>
                                                {order.description && (
                                                    <div className="text-xs text-gray-400 font-poppins-regular mt-1 max-w-xs truncate">
                                                        {order.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-poppins-bold text-gray-900">
                                                    {order.quantity} kg
                                                </div>
                                                <div className="text-sm text-green-600 font-poppins-bold">
                                                    Rs. {order.price.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-500 font-poppins-regular">
                                                    <Calendar size={14} className="mr-1" />
                                                    {formatDate(order.addedDate)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col items-start space-y-2">
                                                    <button
                                                        onClick={() => handleConfirmOrder(order)}
                                                        className="bg-green-500 w-[100px] hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm font-poppins-bold transition-colors flex items-center space-x-1"
                                                    >
                                                        <CheckCircle size={14} />
                                                        <span>Confirm</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectOrder(order)}
                                                        className="bg-red-500 w-[100px] hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-poppins-bold transition-colors flex items-center space-x-1"
                                                    >
                                                        <XCircle size={14} />
                                                        <span>Reject</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 bg-white">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500 font-poppins-regular">
                                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-poppins-regular text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>

                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;
                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => paginate(pageNumber)}
                                                        className={`px-3 py-1 border rounded-md text-sm font-poppins-regular ${
                                                            currentPage === pageNumber
                                                                ? 'bg-[#88C34E] text-white border-[#88C34E]'
                                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            })}

                                            <button
                                                onClick={() => paginate(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-poppins-regular text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirmModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-green-100 rounded-full mr-4">
                                <CheckCircle size={24} className="text-green-600" />
                            </div>
                            <h3 className="text-lg font-poppins-bold text-gray-800">
                                Confirm Order
                            </h3>
                        </div>
                        <p className="text-gray-600 font-poppins-regular mb-4">
                            Are you sure you want to confirm Order #{selectedOrder.orderID} for {selectedOrder.productName}?
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 mb-6">
                            <div className="text-sm text-gray-600 font-poppins-regular">
                                <strong>Customer:</strong> {selectedOrder.customerName}<br />
                                <strong>Quantity:</strong> {selectedOrder.quantity} kg<br />
                                <strong>Price:</strong> Rs. {selectedOrder.price.toFixed(2)}
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-poppins-regular transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmOrder}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-poppins-bold transition-colors flex items-center justify-center"
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <>
                                        <Check size={16} className="mr-1" />
                                        Confirm Order
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-red-100 rounded-full mr-4">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-poppins-bold text-gray-800">
                                Reject Order
                            </h3>
                        </div>
                        <p className="text-gray-600 font-poppins-regular mb-4">
                            Are you sure you want to reject Order #{selectedOrder.orderID} for {selectedOrder.productName}?
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 mb-6">
                            <div className="text-sm text-gray-600 font-poppins-regular">
                                <strong>Customer:</strong> {selectedOrder.customerName}<br />
                                <strong>Quantity:</strong> {selectedOrder.quantity} kg<br />
                                <strong>Price:</strong> Rs. {selectedOrder.price.toFixed(2)}
                            </div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                            <p className="text-red-700 text-sm font-poppins-regular">
                                <strong>Warning:</strong> This action cannot be undone. The customer will be notified of the rejection.
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-poppins-regular transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={rejectOrder}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-poppins-bold transition-colors flex items-center justify-center"
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <>
                                        <X size={16} className="mr-1" />
                                        Reject Order
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderNotificationsTable;