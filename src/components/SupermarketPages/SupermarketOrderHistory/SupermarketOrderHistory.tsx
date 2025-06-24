"use client";

import React, { useState, useEffect } from 'react';
import { Edit, Trash2, User, Package, ShoppingCart, Calendar, DollarSign, Search, Filter, AlertTriangle, Check, X, Eye } from 'lucide-react';
import axios from 'axios';
import { getWithExpiry } from '../../../../auth-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from "react-toastify";

const ConsumerOrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        productName: '',
        category: '',
        farmerName: '',
        status: '' // 'confirmed', 'pending', 'rejected', or ''
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [profileImages, setProfileImages] = useState({});

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [orders, filters]);

    // Fetch profile images for all farmers
    useEffect(() => {
        filteredOrders.forEach(order => {
            if (order.rawOrder?.farmerProduct?.user?.userID && !profileImages[order.rawOrder.farmerProduct.user.userID]) {
                fetchFarmerProfileImage(order.rawOrder.farmerProduct.user.userID);
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

            const response = await axios.get(`http://localhost:8081/api/user/viewSupermarketOrdersByConsumerID/${userID}`);

            if (response.data && response.data.supermarketOrderGetResponse) {
                const ordersData = response.data.supermarketOrderGetResponse;

                const processedOrders = ordersData
                    .filter(order =>
                        order.active === true &&
                        order.addedToCart === false &&
                        order.removedFromCart === false
                    )
                    .map(order => {
                        // Determine order status
                        let status = 'pending';
                        if (order.confirmed === true && order.rejected === false) {
                            status = 'confirmed';
                        } else if (order.confirmed === false && order.rejected === true) {
                            status = 'rejected';
                        }

                        return {
                            id: `consumer-${order.orderID}`,
                            orderID: order.orderID,
                            productID: order.farmerProduct?.productID || 0,
                            productName: order.productName,
                            category: order.productCategory || 'N/A',
                            farmerName: order.farmerProduct?.user ?
                                `${order.farmerProduct.user.firstName} ${order.farmerProduct.user.lastName}` : 'N/A',
                            farmerEmail: order.farmerProduct?.user?.userEmail || 'N/A',
                            quantity: order.requiredQuantity,
                            price: order.price,
                            addedDate: new Date(order.addedDate),
                            description: order.description,
                            status: status,
                            rawOrder: order
                        };
                    })
                    .sort((a, b) => b.addedDate - a.addedDate);

                setOrders(processedOrders);
            }

        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch order history');
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

        if (filters.farmerName) {
            filtered = filtered.filter(order =>
                order.farmerName.toLowerCase().includes(filters.farmerName.toLowerCase())
            );
        }

        if (filters.status) {
            filtered = filtered.filter(order => order.status === filters.status);
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
            farmerName: '',
            status: ''
        });
        setCurrentPage(1);
    };

    const handleProfileClick = (order) => {
        if (order.rawOrder && order.rawOrder.farmerProduct && order.rawOrder.farmerProduct.user && order.rawOrder.farmerProduct.user.userID) {
            router.push(`/supermarketViewFarmerProfile?userID=${order.rawOrder.farmerProduct.user.userID}`);
        }
    };

    const handleUpdateOrder = (order) => {
        const encodedOrder = encodeURIComponent(JSON.stringify(order.rawOrder));
        router.push(`/supermarketUpdateProductDetailsPage?orderDetails=${encodedOrder}&productID=${order.productID}&orderID=${order.orderID}`);
    };

    const handleDeleteOrder = (order) => {
        setSelectedOrder(order);
        setShowDeleteModal(true);
    };

    const deleteOrder = async () => {
        if (!selectedOrder) return;

        try {
            setActionLoading(true);
            await axios.put(`http://localhost:8081/api/user/supermarket-order-products/${selectedOrder.orderID}/delete`);
            setOrders(prev => prev.filter(order => order.id !== selectedOrder.id));
            toast.success('Order deleted successfully!');
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Failed to delete order. Please try again.');
        } finally {
            setActionLoading(false);
            setShowDeleteModal(false);
            setSelectedOrder(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-50 border-green-200';
            case 'pending': return 'bg-blue-50 border-blue-200';
            case 'rejected': return 'bg-red-50 border-red-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-poppins-bold";
        switch (status) {
            case 'confirmed':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'pending':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'rejected':
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
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
        <div className="p-6 bg-gray-100 min-h-screen mt-[60px] ">
            <div className="max-w-7xl mx-auto">
                {/*<div className="mb-6">*/}
                {/*    <h1 className="text-3xl font-poppins-bold text-gray-800 mb-2">*/}
                {/*        Order History*/}
                {/*    </h1>*/}
                {/*    <p className="text-gray-600 font-poppins-regular">*/}
                {/*        View and manage your order history*/}
                {/*    </p>*/}
                {/*</div>*/}

                {/* Filter Section */}
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
                        {/*<div>*/}
                        {/*    <label className="block text-sm font-poppins-bold text-gray-700 mb-2">*/}
                        {/*        Status*/}
                        {/*    </label>*/}
                        {/*    <select*/}
                        {/*        value={filters.status}*/}
                        {/*        onChange={(e) => handleFilterChange('status', e.target.value)}*/}
                        {/*        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#88C34E] focus:border-transparent font-poppins-regular"*/}
                        {/*    >*/}
                        {/*        <option value="">All Status</option>*/}
                        {/*        <option value="confirmed">Confirmed</option>*/}
                        {/*        <option value="pending">Pending</option>*/}
                        {/*        <option value="rejected">Rejected</option>*/}
                        {/*    </select>*/}
                        {/*</div>*/}
                        <div>
                            <label className="block text-sm font-poppins-bold text-gray-700 mb-2">
                                Farmer Name
                            </label>
                            <input
                                type="text"
                                value={filters.farmerName}
                                onChange={(e) => handleFilterChange('farmerName', e.target.value)}
                                placeholder="Search by farmer name..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#88C34E] focus:border-transparent font-poppins-regular"
                            />
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-xl font-poppins-bold text-gray-800">
                                    Supermarket Farmer Product Orders ({filteredOrders.length})
                                </h2>
                                <div className="flex items-center">
                                    <label className="text-sm font-poppins-bold text-gray-700 mr-2">
                                        Status:
                                    </label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#88C34E] focus:border-transparent font-poppins-regular text-sm"
                                    >
                                        <option value="">All Status</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="pending">Pending</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
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
                                {orders.length === 0 ? 'No orders in your history' : 'Try adjusting your filters'}
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
                                            Farmer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-poppins-bold text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-poppins-bold text-gray-500 uppercase tracking-wider">
                                            Quantity & Price
                                        </th>
                                        {/*<th className="px-6 py-4 text-left text-xs font-poppins-bold text-gray-500 uppercase tracking-wider">*/}
                                        {/*    Date*/}
                                        {/*</th>*/}
                                        <th className="px-6 py-4 text-left text-xs font-poppins-bold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-poppins-bold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.map((order) => (
                                        <tr key={order.id} className={`hover:bg-gray-50 transition-colors border-l-4 ${getStatusColor(order.status)}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <div className="text-sm font-poppins-bold text-gray-900">
                                                            Order #{order.orderID}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-poppins-regular">
                                                            Consumer Order
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500 font-poppins-regular">
                                                            <Calendar size={14} className="mr-1" />
                                                            {formatDate(order.addedDate)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div
                                                        className="w-10 h-10 rounded-full mr-3 cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-[#88C34E] transition-colors"
                                                        onClick={() => handleProfileClick(order)}
                                                    >
                                                        {profileImages[order.rawOrder?.farmerProduct?.user?.userID] ? (
                                                            <img
                                                                src={profileImages[order.rawOrder.farmerProduct.user.userID]}
                                                                alt="Profile"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-green-500 flex items-center justify-center">
                                                                <User size={20} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-poppins-bold text-gray-900">
                                                            {order.farmerName}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-poppins-regular">
                                                            {order.farmerEmail}
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
                                                {/*{order.description && (*/}
                                                {/*    <div className="text-xs text-gray-400 font-poppins-regular mt-1 max-w-xs truncate">*/}
                                                {/*        {order.description}*/}
                                                {/*    </div>*/}
                                                {/*)}*/}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-poppins-bold text-gray-900">
                                                    {order.quantity} kg
                                                </div>
                                                <div className="text-sm text-green-600 font-poppins-bold">
                                                    Rs. {order.price.toFixed(2)}
                                                </div>
                                            </td>
                                            {/*<td className="px-6 py-4 whitespace-nowrap">*/}
                                            {/*    <div className="flex items-center text-sm text-gray-500 font-poppins-regular">*/}
                                            {/*        <Calendar size={14} className="mr-1" />*/}
                                            {/*        {formatDate(order.addedDate)}*/}
                                            {/*    </div>*/}
                                            {/*</td>*/}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={getStatusBadge(order.status)}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col items-start space-y-2">
                                                    <button
                                                        onClick={() => handleUpdateOrder(order)}
                                                        className="bg-blue-500 w-[100px] hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-poppins-bold transition-colors flex items-center space-x-1"
                                                    >
                                                        <Edit size={14} />
                                                        <span>Update</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order)}
                                                        className="bg-red-500 w-[100px] hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-poppins-bold transition-colors flex items-center space-x-1"
                                                    >
                                                        <Trash2 size={14} />
                                                        <span>Delete</span>
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

            {/* Delete Modal */}
            {showDeleteModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-red-100 rounded-full mr-4">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-poppins-bold text-gray-800">
                                Delete Order
                            </h3>
                        </div>
                        <p className="text-gray-600 font-poppins-regular mb-4">
                            Are you sure you want to delete Order #{selectedOrder.orderID} for {selectedOrder.productName}?
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 mb-6">
                            <div className="text-sm text-gray-600 font-poppins-regular">
                                <strong>Farmer:</strong> {selectedOrder.farmerName}<br />
                                <strong>Quantity:</strong> {selectedOrder.quantity} kg<br />
                                <strong>Price:</strong> Rs. {selectedOrder.price.toFixed(2)}
                            </div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                            <p className="text-red-700 text-sm font-poppins-regular">
                                <strong>Warning:</strong> This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-poppins-regular transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteOrder}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-poppins-bold transition-colors flex items-center justify-center"
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <>
                                        <Trash2 size={16} className="mr-1" />
                                        Delete Order
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

export default ConsumerOrderHistory;