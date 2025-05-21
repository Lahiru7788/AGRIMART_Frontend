"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination } from "@mui/material";
import Image from "next/image";
import { toast } from "react-toastify";

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
                {/* Green circular search icon */}
                <div className="absolute left-0 flex items-center justify-center w-12 h-12 bg-[#88C34E] rounded-full z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Search input with left padding to accommodate the icon */}
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

const OrderCard = ({ order }) => {
    const [showOfferDetails, setShowOfferDetails] = useState(false);
    const [offerDetails, setOfferDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch offer details if available
        if (order.hasOffer) {
            fetchOfferDetails();
        }
    }, [order.orderID]);

    const fetchOfferDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewConsumerOffers/${order.orderID}`
            );

            // Access the correct part of the response structure
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

    const handleAccept = () => {
        toast.success('Order accepted successfully!', {
            position: "top-right",
            autoClose: 5000,
        });
    };

    return (
        <div className={`bg-white shadow-md rounded-xl mb-4 overflow-hidden relative w-full ${order.hasOffer ? 'shadow-[#88C34E]/40' : ''}`}>
            {/* Offer tag in top right */}
            {order.hasOffer && (
                <div
                    className="absolute top-2 right-2 bg-[#88C34E] font-poppins-regular text-white px-2 py-1 rounded-lg cursor-pointer text-sm hover:bg-opacity-80 transition-colors"
                    onClick={toggleOfferDetails}
                >
                    Offer Available
                </div>
            )}

            <div className="flex">
                {/* Left section - Image (centered vertically with white background) */}
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

                {/* Right section - Action buttons (removed border-l) */}
                <div className="w-24 flex-shrink-0 flex flex-col items-center mr-[20px] justify-center p-2">
                    <button
                        onClick={handleAccept}
                        className="bg-[#88C34E] hover:bg-[#7AB33D] text-white font-poppins-bold px-4 py-2 rounded-lg w-full mb-2 transition-colors text-center"
                    >
                        Accept
                    </button>
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
    const itemsPerPage = 5; // Increased to show more orders per page
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState(["Vegetables", "Fruits", "Cereals"]);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        // Apply both search and category filters
        filterOrders();
    }, [orders, selectedCategory]);

    const filterOrders = (searchTerm = "") => {
        let filtered = [...orders];

        // Filter by search term if provided
        if (searchTerm.trim()) {
            filtered = filtered.filter((order) =>
                order.productName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category if selected
        if (selectedCategory) {
            filtered = filtered.filter(
                (order) => order.productCategory === selectedCategory
            );
        }

        setFilteredOrders(filtered);
        // Reset to first page when filtering
        setPage(1);
    };

    const handleSearch = (searchTerm) => {
        filterOrders(searchTerm);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewConsumerAddOrders`
            );

            const orderList = response.data.consumerAddOrderGetResponse || [];

            // Filter out deleted orders
            const activeOrders = orderList.filter(order => order.active !== false);

            // Fetch images and check offers for each order
            const ordersWithImages = await Promise.all(
                activeOrders.map(async (order) => {
                    let updatedOrder = { ...order, imageUrl: null, hasOffer: false };

                    // Check if order has offers
                    try {
                        const offerResponse = await axios.get(
                            `http://localhost:8081/api/user/viewConsumerOffers/${order.orderID}`
                        );

                        // If offers array exists and has items, order has an offer
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
                                { responseType: "blob" }
                            );
                            updatedOrder.imageUrl = URL.createObjectURL(imageResponse.data);
                        } catch (error) {
                            console.error(`Error fetching image for order ${order.orderID}:`, error);
                        }
                    }

                    return updatedOrder;
                })
            );

            setOrders(ordersWithImages);
            setFilteredOrders(ordersWithImages);

            // Extract unique categories from orders
            const uniqueCategories = [...new Set(ordersWithImages.map(order => order.productCategory))].filter(Boolean);
            if (uniqueCategories.length > 0) {
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const handleChange = (event, value) => {
        setPage(value);
    };

    const paginatedOrders = filteredOrders.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="flex flex-col h-screen pt-[100px] bg-gray-100">
            {/* Fixed Header Section */}
            <div className="flex-shrink-0">
                {/* Header with title */}
                {/*<div className="mb-6 text-center px-6">*/}
                {/*    <h1 className="text-2xl font-poppins-bold text-gray-800">Available Consumer Orders</h1>*/}
                {/*    <p className="text-gray-600">Browse and accept orders from consumers</p>*/}
                {/*</div>*/}

                {/* Filters row */}
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
                {/* Order cards - vertically stacked */}
                <div className="space-y-4 mb-6">
                    {paginatedOrders.length > 0 ? (
                        paginatedOrders.map((order) => (
                            <OrderCard
                                key={order.orderID}
                                order={order}
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