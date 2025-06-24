"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination } from "@mui/material";
import Image from "next/image";
import { toast } from "react-toastify";
import { getWithExpiry } from "../../../../auth-utils";

const CategoryDropdown = ({ categories, onCategoryChange }) => {
    return (
        <div className="relative ml-[8px]">
            <select
                onChange={(e) => onCategoryChange(e.target.value)}
                className="px-4 py-2 w-[280px] bg-white font-poppins-regular border-none shadow-md rounded-full focus:ring-2 focus:ring-[#88C34E] outline-none appearance-none"
            >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                    <option key={index} value={category}>
                        {category}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </div>
        </div>
    );
};

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <div className="w-full flex justify-end">
            <div className="relative flex items-center">
                <div className="absolute left-0 flex items-center justify-center w-12 h-12 bg-[#88C34E] rounded-full z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search here"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-14 pr-4 py-2 w-[280px] bg-white font-poppins-regular border-none shadow-md rounded-full focus:ring-2 focus:ring-[#88C34E] outline-none"
                />
            </div>
        </div>
    );
};

const OrderCard = ({ order, onOrderUpdate, userID }) => {
    const [showOfferDetails, setShowOfferDetails] = useState(false);
    const [offerDetails, setOfferDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        if (order.hasOffer) {
            fetchOfferDetails();
        }
    }, [order.orderID]);

    const fetchOfferDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewConsumerOffers/${order.orderID}`,
                {
                    withCredentials: true
                }
            );

            if (response.data.consumerOfferGetResponse &&
                response.data.consumerOfferGetResponse.length > 0) {
                setOfferDetails(response.data.consumerOfferGetResponse[0]);
            }
        } catch (error) {
            console.error("Error fetching offer details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleOfferDetails = () => {
        setShowOfferDetails(!showOfferDetails);
    };

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            // First API call - PUT request to confirm order
            const confirmResponse = await axios.put(
                `http://localhost:8081/api/user/consumerConfirm-addOrder/${order.orderID}/confirm`,
                {},
                {
                    withCredentials: true
                }
            );

            console.log('Confirm response:', confirmResponse.data);

            // Second API call - POST request to farmer accept consumer orders
            const acceptData = {
                orderID: order.orderID,
                productName: order.productName,
                price: order.price,
                requiredQuantity: order.requiredQuantity,
                requiredTime: order.requiredTime,
                description: order.description,
                addedDate: order.addedDate,
                farmerID: userID, // Include farmer ID
                productCategory: order.productCategory // Include product category if needed
            };

            console.log('Sending accept data:', acceptData);

            const acceptResponse = await axios.post(
                'http://localhost:8081/api/user/farmerAcceptConsumerOrders',
                acceptData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );

            console.log('Accept response:', acceptResponse.data);

            toast.success('Order accepted successfully!', {
                position: "top-right",
                autoClose: 5000,
            });

            // Update the order status locally and notify parent component
            const updatedOrder = {
                ...order,
                confirmed: true,
                paid: false // Explicitly set to false when accepting
            };
            onOrderUpdate(updatedOrder);

        } catch (error) {
            console.error("Error accepting order:", error);

            // More detailed error logging
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);

                toast.error(`Failed to accept order: ${error.response.data.message || error.response.statusText}`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            } else if (error.request) {
                console.error('Error request:', error.request);
                toast.error('Network error. Please check your connection.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            } else {
                console.error('Error message:', error.message);
                toast.error('An unexpected error occurred.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } finally {
            setIsAccepting(false);
        }
    };

    // Determine shadow color based on payment status
    const getShadowColor = () => {
        if (order.confirmed && order.paid === false) {
            return 'shadow-red-400/40';
        } else if (order.confirmed && order.paid === true) {
            return 'shadow-green-400/40';
        } else if (order.hasOffer) {
            return 'shadow-[#88C34E]/40';
        }
        return '';
    };

    return (
        <div className={`bg-white shadow-md rounded-xl mb-4 overflow-hidden relative w-full ${getShadowColor()}`}>
            {/* Payment and Offer tags in top right */}
            <div className="absolute top-2 right-2 flex gap-2">
                {/* Payment status tag */}
                {order.confirmed && (
                    <div className={`px-2 py-1 rounded-lg text-sm font-poppins-regular text-white ${
                        order.paid === false ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                        {order.paid === false ? 'Not Paid' : 'Paid'}
                    </div>
                )}

                {/* Offer tag */}
                {order.hasOffer && (
                    <div
                        className="bg-[#88C34E] font-poppins-regular text-white px-2 py-1 rounded-lg cursor-pointer text-sm hover:bg-opacity-80 transition-colors"
                        onClick={toggleOfferDetails}
                    >
                        Offer Available
                    </div>
                )}
            </div>

            <div className="flex">
                {/* Left section - Image */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 bg-white flex items-center justify-center p-2">
                    {order.imageUrl ? (
                        <img
                            src={order.imageUrl}
                            alt={order.productName}
                            className="w-full h-full mt-[20px] ml-[10px] object-cover rounded-lg"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                            <p className="text-gray-500">No image</p>
                        </div>
                    )}
                </div>

                {/* Middle section - Details */}
                <div className="flex-grow p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="font-poppins-bold text-xl mb-1">{order.productName}</h2>
                            <p className="text-gray-500 text-sm mb-2">Order #{order.orderID} • {order.addedDate}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600 font-poppins-bold">Required Quantity:</span>
                            <span className="text-[#88C34E] font-poppins-bold">{order.requiredQuantity}Kg</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600 font-poppins-bold">Required Time:</span>
                            <span className="text-[#88C34E] font-poppins-bold">{order.requiredTime}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600 font-poppins-bold">Price:</span>
                            {order.hasOffer ? (
                                <div className="text-right">
                                    {isLoading ? (
                                        <span className="text-gray-500">Loading...</span>
                                    ) : offerDetails ? (
                                        <div className="flex items-center">
                                            <span className="line-through mr-2 text-gray-400">Rs. {order.price}</span>
                                            <span className="text-red-600 font-poppins-bold">Rs. {offerDetails.newPrice}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[#88C34E] font-poppins-bold">Rs. {order.price}</span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-[#88C34E] font-poppins-bold">Rs. {order.price}</span>
                            )}
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600 font-poppins-bold">Category:</span>
                            <span className="text-[#88C34E] font-poppins-bold">{order.productCategory}</span>
                        </div>
                    </div>

                    <div className="mt-2">
                        <p className="text-gray-600 font-poppins-regular text-sm line-clamp-2">
                            <span className="font-poppins-bold">Description: </span>
                            {order.description}
                        </p>
                    </div>
                </div>

                {/* Right section - Action buttons */}
                <div className="w-24 flex-shrink-0 flex flex-col items-center mr-[20px] justify-center p-2">
                    {!order.confirmed ? (
                        <button
                            onClick={handleAccept}
                            disabled={isAccepting}
                            className="bg-[#88C34E] hover:bg-[#7AB33D] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-poppins-bold px-4 py-2 rounded-lg w-full mb-2 transition-colors text-center"
                        >
                            {isAccepting ? 'Accepting...' : 'Accept'}
                        </button>
                    ) : (
                        <div className="bg-gray-100 text-gray-600 font-poppins-bold px-4 py-2 rounded-lg w-full mb-2 text-center">
                            Accepted
                        </div>
                    )}
                </div>
            </div>

            {/* Offer Details Popup */}
            {showOfferDetails && offerDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={toggleOfferDetails}>
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-poppins-bold text-[#88C34E]">Special Offer!</h3>
                            <button
                                onClick={toggleOfferDetails}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-lg font-poppins-bold text-gray-800">{offerDetails.offerName}</h4>
                            <p className="text-gray-600 mt-2">{offerDetails.offerDescription}</p>
                        </div>

                        <div className="bg-gray-100 rounded p-3 mb-4">
                            <div className="flex justify-between">
                                <span className="font-poppins-regular">Original Price:</span>
                                <span className="line-through">Rs. {order.price}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="font-poppins-bold">Offer Price:</span>
                                <span className="font-poppins-bold text-red-600">Rs. {offerDetails.newPrice}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="font-poppins-regular">Savings:</span>
                                <span className="text-green-600 font-poppins-bold">
                                    Rs. {(order.price - offerDetails.newPrice).toFixed(2)}
                                    ({((order.price - offerDetails.newPrice) / order.price * 100).toFixed(0)}% off)
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 text-center font-poppins-regular">
                            {offerDetails.active ? "This offer is currently active" : "This offer is currently inactive"}
                        </p>

                        <button
                            className="w-full mt-4 bg-[#88C34E] hover:bg-[#7AB33D] text-white font-poppins-bold py-2 rounded-lg transition-colors"
                            onClick={toggleOfferDetails}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ConsumerOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState(["Vegetables", "Fruits", "Cereals"]);
    const [userID, setUserID] = useState(null);

    // Get userID from auth-utils
    useEffect(() => {
        const getUserID = () => {
            try {
                const user = getWithExpiry('userID');
                if (user) {
                    setUserID(user);
                } else {
                    console.error("User not authenticated");
                    toast.error('Please log in to view orders.', {
                        position: "top-right",
                        autoClose: 5000,
                    });
                }
            } catch (error) {
                console.error("Error getting user ID:", error);
                toast.error('Authentication error. Please log in again.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        };

        getUserID();
    }, []);

    // Initial fetch when userID is available
    useEffect(() => {
        if (userID) {
            fetchAllOrdersData();
        }
    }, [userID]);

    // Re-filter orders when orders or category changes
    useEffect(() => {
        filterOrders();
    }, [orders, selectedCategory]);

    const filterOrders = (searchTerm = "") => {
        let filtered = [...orders];

        if (searchTerm.trim()) {
            filtered = filtered.filter((order) =>
                order.productName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(
                (order) => order.productCategory === selectedCategory
            );
        }

        setFilteredOrders(filtered);
        setPage(1);
    };

    const handleSearch = (searchTerm) => {
        filterOrders(searchTerm);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handleOrderUpdate = (updatedOrder) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.orderID === updatedOrder.orderID ? updatedOrder : order
            )
        );
    };

    // Combined function to fetch all order data
    const fetchAllOrdersData = async () => {
        if (!userID) return;

        try {
            // First fetch the consumer orders
            const ordersResponse = await axios.get(
                `http://localhost:8081/api/user/viewConsumerAddOrders`,
                {
                    withCredentials: true
                }
            );

            const orderList = ordersResponse.data.consumerAddOrderGetResponse || [];
            const activeOrders = orderList.filter(order => order.active !== false);

            // Then fetch farmer orders to get payment status
            const farmerResponse = await axios.get(
                `http://localhost:8081/api/user/viewConsumerProductOrdersByFarmerID/${userID}`,
                {
                    params: {
                        active: false,
                        confirmed: false,
                        paid: false
                    },
                    withCredentials: true
                }
            );

            const farmerOrders = farmerResponse.data.farmerConfirmConsumerOrderGetResponse || [];

            // Process orders with images, offers, and payment status
            const ordersWithAllData = await Promise.all(
                activeOrders.map(async (order) => {
                    let updatedOrder = {
                        ...order,
                        imageUrl: null,
                        hasOffer: false,
                        confirmed: false,
                        paid: null
                    };

                    // Check payment status from farmer orders
                    const farmerOrder = farmerOrders.find(fo =>
                        fo.consumerAddOrder && fo.consumerAddOrder.orderID === order.orderID
                    );

                    if (farmerOrder) {
                        updatedOrder.confirmed = farmerOrder.consumerAddOrder.confirmed;
                        updatedOrder.paid = farmerOrder.paid;
                    }

                    // Check if order has offers
                    try {
                        const offerResponse = await axios.get(
                            `http://localhost:8081/api/user/viewConsumerOffers/${order.orderID}`,
                            {
                                withCredentials: true
                            }
                        );

                        updatedOrder.hasOffer =
                            offerResponse.data.consumerOfferGetResponse &&
                            offerResponse.data.consumerOfferGetResponse.length > 0;
                    } catch (error) {
                        console.error(`Error checking offers for order ${order.orderID}:`, error);
                    }

                    // Fetch order image if order ID exists
                    if (order.orderID) {
                        try {
                            const imageResponse = await axios.get(
                                `http://localhost:8081/api/user/viewConsumerAddOrderImage?orderID=${order.orderID}`,
                                {
                                    responseType: "blob",
                                    withCredentials: true
                                }
                            );
                            updatedOrder.imageUrl = URL.createObjectURL(imageResponse.data);
                        } catch (error) {
                            console.error(`Error fetching image for order ${order.orderID}:`, error);
                        }
                    }

                    return updatedOrder;
                })
            );

            setOrders(ordersWithAllData);
            setFilteredOrders(ordersWithAllData);

            // Extract unique categories from orders
            const uniqueCategories = [...new Set(ordersWithAllData.map(order => order.productCategory))].filter(Boolean);
            if (uniqueCategories.length > 0) {
                setCategories(uniqueCategories);
            }

        } catch (error) {
            console.error("Error fetching orders data:", error);
            toast.error('Failed to fetch orders. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const handleChange = (event, value) => {
        setPage(value);
    };

    const paginatedOrders = filteredOrders.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    // Show loading state if userID is not available
    if (!userID) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#88C34E]"></div>
                    <p className="mt-4 text-gray-600 font-poppins-regular">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen pt-[100px] bg-gray-100">
            {/* Fixed Header Section */}
            <div className="flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 px-6">
                    <CategoryDropdown
                        onCategoryChange={handleCategoryChange}
                        categories={categories}
                    />
                    <SearchBar onSearch={handleSearch} />
                </div>
            </div>

            {/* Scrollable Cards Section */}
            <div className="flex-grow overflow-y-auto px-6">
                <div className="space-y-4 mb-6">
                    {paginatedOrders.length > 0 ? (
                        paginatedOrders.map((order) => (
                            <OrderCard
                                key={order.orderID}
                                order={order}
                                onOrderUpdate={handleOrderUpdate}
                                userID={userID}
                            />
                        ))
                    ) : (
                        <div className="w-full text-center py-8 bg-white rounded-lg shadow-md">
                            <p className="text-gray-500 font-poppins-regular text-lg">No orders found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Footer with Pagination */}
            <div className="flex-shrink-0 py-4 border-t border-gray-200 bg-white px-6">
                <div className="flex justify-center">
                    <Pagination
                        count={Math.ceil(filteredOrders.length / itemsPerPage)}
                        page={page}
                        onChange={handleChange}
                        color="primary"
                        size="large"
                    />
                </div>
            </div>
        </div>
    );
};

export default ConsumerOrderList;