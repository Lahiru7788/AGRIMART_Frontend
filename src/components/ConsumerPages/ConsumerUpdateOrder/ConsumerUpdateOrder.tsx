"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination } from "@mui/material";
import Image from "next/image";
import { toast } from "react-toastify";
import { getWithExpiry } from "../../../../auth-utils";

const CategoryDropdown = ({ categories, onCategoryChange }) => {
    return (
        <div className="relative mt-[-10px] ml-[8px] ">
            <select
                onChange={(e) => onCategoryChange(e.target.value)}
                className="px-4 py-2  w-[280px] bg-white font-poppins-regular border-none shadow-md rounded-full focus:ring-2 focus:ring-[#88C34E] outline-none appearance-none"
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
        <div className="w-full flex justify-end mt-[-10px] ">
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

const OrderCard = ({ order, onUpdateClick }) => {
    const [showOfferDetails, setShowOfferDetails] = useState(false);
    const [offerDetails, setOfferDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Add this function to handle delete confirmation popup
    const toggleDeleteConfirm = () => {
        setShowDeleteConfirm(!showDeleteConfirm);
    };

    // Add this function to handle actual deletion
    const handleDelete = async () => {
        try {
            await axios.put(
                `http://localhost:8081/api/user/consumer-order/${order.orderID}/delete`,
                {},
                { withCredentials: true }
            );
            toggleDeleteConfirm();
            toast.success('Order deleted successfully!', {
                position: "top-right",
                autoClose: 5000,
            });
            window.location.reload(); // Refresh the page after deletion

        } catch (error) {
            console.error("Error deleting order:", error);
            alert("Failed to delete the order. Please try again.");
        }
    };

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

    // Different shadow styling based on whether order has an offer
    const cardShadowClass = order.hasOffer
        ? "bg-white shadow-md shadow-[#88C34E] border rounded-[20px] p-4 w-80 relative"
        : "bg-white shadow-md rounded-[20px] p-4 w-80 relative";

    return (
        <div className={`${cardShadowClass} w-[320px] ml-[8px] mt-[-30px] p-3`}>
            {order.hasOffer && (
                <div
                    className="absolute top-2 right-2 bg-[#88C34E] font-poppins-regular text-white px-2 py-1 rounded-lg cursor-pointer text-sm hover:bg-red-500 transition-colors"
                    onClick={toggleOfferDetails}
                >
                    Offer Available
                </div>
            )}
            <h2 className="text-gray-600 font-poppins-bold">
                Order #{order.orderID}
            </h2>
            <p className="text-gray-400 font-poppins-regular text-sm">
                {order.addedDate}
            </p>
            <h3 className="text-lg font-poppins-bold text-center">
                {order.productName}
            </h3>
            {/* Image frame with fixed dimensions */}
            <div className="w-full h-24 flex items-center justify-center bg-white border border-gray-300 rounded-lg overflow-hidden my-2">
                {order.imageUrl ? (
                    <Image
                        src={order.imageUrl}
                        alt={order.productName}
                        width={96}
                        height={96}
                        className="object-contain max-h-24"
                    />
                ) : (
                    <p>No image available</p>
                )}
            </div>

            {/* Required Quantity - Left/Right Layout */}
            <div className="flex justify-between items-center my-2">
                <p className="text-gray-600 font-poppins-bold">Required Quantity:</p>
                <p className="text-[#88C34E] font-poppins-bold">{order.requiredQuantity}Kg</p>
            </div>

            {/* Required Time - Left/Right Layout */}
            <div className="flex justify-between items-center my-2">
                <p className="text-gray-600 font-poppins-bold">Required Time:</p>
                <p className="text-[#88C34E] font-poppins-bold">{order.requiredTime}</p>
            </div>

            {/* Price - Left/Right Layout */}
            <div className="flex justify-between items-center my-2">
                <p className="text-gray-600 font-poppins-bold">1KG Price:</p>
                {order.hasOffer ? (
                    <div className="text-right">
                        {isLoading ? (
                            <p className="text-gray-500">Loading...</p>
                        ) : offerDetails ? (
                            <div className="flex items-center">
                                <span className="line-through mr-2 text-[#88C34E] font-poppins-bold">Rs. {order.price}</span>
                                <span className="text-red-600 font-poppins-bold">Rs. {offerDetails.newPrice}</span>
                            </div>
                        ) : (
                            <p className="text-[#88C34E] font-poppins-bold">Rs. {order.price}</p>
                        )}
                    </div>
                ) : (
                    <p className="text-[#88C34E] font-poppins-bold">Rs. {order.price}</p>
                )}
            </div>

            {/* Description - Left/Right Layout */}
            <div className="mt-2">
                <p className="text-gray-600 font-poppins-bold mb-1">Description:</p>
                <div className="bg-gray-100 rounded-lg p-2 h-[71px] overflow-y-auto">
                    <p className="text-gray-700 font-poppins-regular">
                        {order.description}
                    </p>
                </div>
            </div>



            <div className="flex justify-between mt-2 pt-2 border-t border-gray-300">
                <button
                    className="text-green-600 text-xl font-bold"
                    onClick={() => onUpdateClick(order)}
                >⚙</button>
                <button className="text-red-600 text-xl font-bold" onClick={toggleDeleteConfirm}>🗑</button>
            </div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={toggleDeleteConfirm}>
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-poppins-bold text-red-600">Confirm Deletion</h3>
                            <button
                                onClick={toggleDeleteConfirm}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 font-poppins-regular">
                                Are you sure you want to delete order <span className="font-poppins-bold">{order.productName}</span>?
                            </p>
                            <p className="text-gray-500 text-sm mt-2">
                                This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                className="w-1/2 bg-gray-400 hover:bg-gray-500 text-white font-poppins-bold py-2 rounded-lg transition-colors"
                                onClick={toggleDeleteConfirm}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-poppins-bold py-2 rounded-lg transition-colors"
                                onClick={handleDelete}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

const UpdateOrderForm = ({ order, onCancel, onSubmit }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [image, setImage] = useState(order.imageUrl || null);
    const [file, setFile] = useState(null);
    const [orderId] = useState(order.orderID);

    // Order form data state
    const [formData, setFormData] = useState({
        productName: order.productName || "",
        price: order.price || "",
        requiredQuantity: order.requiredQuantity || "",
        requiredTime: order.requiredTime || "",
        description: order.description || "",
        addedDate: order.addedDate || "",
        productCategory: order.productCategory || "",
    });

    // Offer form data state
    const [offerFormData, setOfferFormData] = useState({
        offerName: "",
        newPrice: "",
        offerDescription: "",
        active: true
    });

    // Load offer details if order has an offer
    useEffect(() => {
        if (order.hasOffer) {
            fetchOfferDetails();
        }
    }, [order.orderID]);

    const fetchOfferDetails = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewConsumerOffers/${order.orderID}`
            );

            if (response.data.consumerOfferGetResponse &&
                response.data.consumerOfferGetResponse.length > 0) {
                const offerDetails = response.data.consumerOfferGetResponse[0];
                setOfferFormData({
                    offerName: offerDetails.offerName || "",
                    newPrice: offerDetails.newPrice || "",
                    offerDescription: offerDetails.offerDescription || "",
                    active: offerDetails.active !== undefined ? offerDetails.active : true
                });
            }
        } catch (error) {
            console.error("Error fetching offer details:", error);
        }
    };

    // Handle order form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle offer form changes
    const handleOfferChange = (e) => {
        const { name, value } = e.target;
        setOfferFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle image selection
    const handleImageClick = () => {
        document.getElementById("updateFileInput")?.click();
    };

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);

            // Create preview URL
            const imageUrl = URL.createObjectURL(selectedFile);
            setImage(imageUrl);
        }
    };

    // Step 1: Submit order details update
    const handleSubmitOrderUpdate = async () => {
        try {
            // Update the order details
            const updatedData = {
                orderID: orderId,
                productName: formData.productName,
                price: formData.price,
                requiredQuantity: formData.requiredQuantity,
                requiredTime: formData.requiredTime,
                description: formData.description,
                addedDate: formData.addedDate,
                productCategory: formData.productCategory,
            };

            await axios.post(
                `http://localhost:8081/api/user/consumerAddOrders`,
                updatedData,
                { withCredentials: true }
            );

            toast.success('Order details updated successfully!', {
                position: "top-right",
                autoClose: 5000,
            });

            // Move to step 2
            setCurrentStep(2);
        } catch (error) {
            console.error("Error updating order details:", error);
            alert("Failed to update order details. Please try again.");
        }
    };

    // Step 2: Upload new image
    const handleImageUpdate = async () => {
        // If no new file is selected, just move to next step
        if (!file) {
            setCurrentStep(3);
            return;
        }

        try {
            const imageFormData = new FormData();
            imageFormData.append("productImage", file);
            imageFormData.append("orderID", orderId);

            await axios.post(
                `http://localhost:8081/api/user/cAddOrderProductImage`,
                imageFormData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true
                }
            );

            toast.success('Image updated successfully!', {
                position: "top-right",
                autoClose: 5000,
            });

            // Move to step 3
            setCurrentStep(3);
        } catch (error) {
            console.error("Error updating order image:", error);
            alert("Failed to update order image. Please try again.");
        }
    };

    // Step 3: Submit offer update
    const handleSubmitOfferUpdate = async () => {
        try {
            const offerData = {
                orderID: orderId,
                offerName: offerFormData.offerName,
                newPrice: offerFormData.newPrice,
                offerDescription: offerFormData.offerDescription,
                active: offerFormData.active
            };

            // Use the appropriate API endpoint based on whether the order already has an offer
            const endpoint = order.hasOffer ?
                `http://localhost:8081/api/user/consumerOffers` :
                `http://localhost:8081/api/user/consumerOffers`;

            const method = order.hasOffer ? axios.post : axios.post;

            await method(
                endpoint,
                offerData,
                { withCredentials: true }
            );

            // Complete the update process
            onSubmit();

            toast.success('Offer updated successfully!', {
                position: "top-right",
                autoClose: 5000,
            });
        } catch (error) {
            console.error("Error updating order offer:", error);
            alert("Failed to update order offer. Please try again.");
        }
    };

    // Render progress bar
    const renderProgressBar = () => (
        <div className="max-w-[1040px] mx-auto mb-8">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                    <div className={`rounded-full w-10 h-10 flex items-center justify-center font-poppins-regular ${currentStep >= 1 ? 'bg-[#88C34E] text-white' : 'bg-gray-300 text-gray-600'}`}>
                        1
                    </div>
                    <span className="ml-2 font-poppins-regular">Order Details</span>
                </div>
                <div className={`h-1 w-64 ${currentStep >= 2 ? 'bg-[#88C34E]' : 'bg-gray-300'}`}></div>
                <div className="flex items-center">
                    <div className={`rounded-full w-10 h-10 flex items-center justify-center font-poppins-regular ${currentStep >= 2 ? 'bg-[#88C34E] text-white' : 'bg-gray-300 text-gray-600'}`}>
                        2
                    </div>
                    <span className="ml-2 font-poppins-regular">Update Image</span>
                </div>
                <div className={`h-1 w-64 ${currentStep >= 3 ? 'bg-[#88C34E]' : 'bg-gray-300'}`}></div>
                <div className="flex items-center">
                    <div className={`rounded-full w-10 h-10 flex items-center justify-center font-poppins-regular ${currentStep >= 3 ? 'bg-[#88C34E] text-white' : 'bg-gray-300 text-gray-600'}`}>
                        3
                    </div>
                    <span className="ml-2 font-poppins-regular">Update Offer</span>
                </div>
            </div>
        </div>
    );

    // Render content based on current step
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="bg-white p-6 rounded-xl shadow-lg flex-1 relative">
                        <div className="absolute top-4 left-4 flex items-center">
                            <div className="bg-[#88C34E] text-white rounded-full w-8 h-8 flex items-center justify-center font-poppins-regular">
                                1
                            </div>
                            <p className="ml-2 font-poppins-regular">Step 1 of 3: Update Order Details</p>
                        </div>

                        <h2 className="text-xl font-poppins-bold mb-6 text-center mt-8">
                            Update Order #{orderId}
                        </h2>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <input
                                type="text"
                                placeholder="Product Name"
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                                className="p-3 bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                required
                            />

                            <select
                                className="w-full shadow-md font-poppins-regular border rounded-[20px] px-4 py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
                                name="productCategory"
                                value={formData.productCategory}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select your Product Category</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Fruits">Fruits</option>
                                <option value="Cereals">Cereals</option>
                            </select>

                            <input
                                type="number"
                                placeholder="Price (without offer)"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="p-3 bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                required
                            />

                            <input
                                type="date"
                                name="addedDate"
                                value={formData.addedDate}
                                onChange={handleChange}
                                className="p-3 bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                required
                            />

                            <input
                                type="number"
                                placeholder="Required Quantity (Kg)"
                                name="requiredQuantity"
                                value={formData.requiredQuantity}
                                onChange={handleChange}
                                className="p-3 w-full bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
                                required
                            />

                            <input
                                type="text"
                                placeholder="Required Time"
                                name="requiredTime"
                                value={formData.requiredTime}
                                onChange={handleChange}
                                className="p-3 w-full bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
                                required
                            />

                            <textarea
                                placeholder="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="p-3 bg-white w-full col-span-2 border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
                                required
                            ></textarea>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="w-1/2 h-[45px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-[20px] transition duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitOrderUpdate}
                                className="w-1/2 h-[45px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-[#88C34E] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300"
                            >
                                Next: Update Image
                            </button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="bg-white p-6 rounded-xl shadow-lg flex-1 relative">
                        <div className="absolute top-4 left-4 flex items-center">
                            <div className="bg-[#88C34E] text-white rounded-full w-8 h-8 flex items-center justify-center font-poppins-regular">
                                2
                            </div>
                            <span className="ml-2 font-poppins-regular">Step 2 of 3: Update Order Image</span>
                        </div>

                        <h2 className="text-xl font-poppins-bold mb-6 text-center mt-8">Update Order Image</h2>

                        <div className="flex justify-center mb-6">
                            <div
                                className="bg-gray-200 p-6 bg-white border shadow-md shadow-gray-300 focus:ring-2 focus:ring-[#5C8F2B] rounded-lg flex flex-col items-center justify-center cursor-pointer w-64 h-64"
                                onClick={handleImageClick}
                            >
                                {image ? (
                                    <img src={image} alt="Selected Product" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <>
                                        <div className="mb-4">📷</div>
                                        <p className="text-gray-600 font-poppins-regular">Click to select product image</p>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                id="updateFileInput"
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="w-1/3 h-[45px] mt-[20px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-[20px] transition duration-300"
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                onClick={onCancel}
                                className="w-1/3 h-[45px] mt-[20px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-red-400 hover:bg-red-500 text-white font-semibold py-2 rounded-[20px] transition duration-300"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleImageUpdate}
                                className="w-1/3 h-[45px] mt-[20px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-[#88C34E] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300"
                            >
                                Next: Update Offer
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="bg-white p-6 rounded-xl shadow-lg flex-1 relative">
                        <div className="absolute top-4 left-4 flex items-center">
                            <div className="bg-[#88C34E] text-white rounded-full w-8 h-8 flex items-center justify-center font-poppins-regular">
                                3
                            </div>
                            <span className="ml-2 font-poppins-regular">Step 3 of 3: Update Product Offer</span>
                        </div>

                        <h2 className="text-xl font-poppins-bold mb-6 text-center mt-8">
                            {order.hasOffer ? "Update Special Offer" : "Add Special Offer"}
                        </h2>

                        <div className="mt-4">
                            <input
                                type="text"
                                placeholder="Offer Name"
                                name="offerName"
                                value={offerFormData.offerName}
                                onChange={handleOfferChange}
                                className="p-3 bg-white border mt-4 font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                required
                            />

                            <input
                                type="number"
                                placeholder="New Price"
                                name="newPrice"
                                value={offerFormData.newPrice}
                                onChange={handleOfferChange}
                                className="p-3 bg-white mt-4 border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                required
                            />

                            <textarea
                                placeholder="Offer Description"
                                name="offerDescription"
                                value={offerFormData.offerDescription}
                                onChange={handleOfferChange}
                                className="p-3 mt-4 bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                required
                                rows={4}
                            ></textarea>

                            <div className="mt-4 flex items-center">
                                <input
                                    type="checkbox"
                                    id="activeOffer"
                                    name="active"
                                    checked={offerFormData.active}
                                    onChange={(e) => setOfferFormData({...offerFormData, active: e.target.checked})}
                                    className="mr-2"
                                />
                                <label htmlFor="activeOffer" className="font-poppins-regular">Make this offer active</label>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                className="w-1/3 h-[45px] mt-[20px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-[20px] transition duration-300"
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                onClick={onCancel}
                                className="w-1/3 h-[45px] mt-[20px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-red-400 hover:bg-red-500 text-white font-semibold py-2 rounded-[20px] transition duration-300"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmitOfferUpdate}
                                className="w-1/3 h-[45px] mt-[20px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-[#88C34E] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300"
                            >
                                Complete Update
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    return (
        <div className="w-full">
            {renderProgressBar()}
            {renderStepContent()}
        </div>
    );
};

const ConsumerOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [updateMode, setUpdateMode] = useState(false);
    const [selectedProduct, setSelectedOrder] = useState(null);
    const itemsPerPage = 3;
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

    const handleDeleteProduct = () => {
        // Refresh the product list after deletion
        fetchOrders();
    };

    const fetchOrders = async () => {
        try {
            // Get userID from localStorage using getWithExpiry
            const userID = getWithExpiry("userID");

            if (!userID) {
                console.error("User ID not found. User might not be logged in.");
                return;
            }

            // Use the userID in the API endpoint
            const response = await axios.get(
                `http://localhost:8081/api/user/viewConsumerAddOrders/${userID}`
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

    const handleUpdateClick = (order) => {
        setSelectedOrder(order);
        setUpdateMode(true);
    };

    const handleCancelUpdate = () => {
        setUpdateMode(false);
        setSelectedOrder(null);
    };

    const handleUpdateSubmit = () => {
        // Refresh the product list after update
        fetchOrders();
        setUpdateMode(false);
        setSelectedOrder(null);
    };


    const paginatedOrders = filteredOrders.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="pt-[100px] p-6 bg-gray-100 min-h-screen relative">
            {/* Filters row */}
            {!updateMode && (
            <div className="flex justify-between items-center mb-6">
                <CategoryDropdown
                    onCategoryChange={handleCategoryChange}
                    categories={categories}
                />
                <SearchBar onSearch={handleSearch} />
            </div>
            )}

            {updateMode && selectedProduct ? (
                <UpdateOrderForm
                    order={selectedProduct}
                    onCancel={handleCancelUpdate}
                    onSubmit={handleUpdateSubmit}
                />
            ) : (
                <>
            <div className="flex flex-wrap gap-6 mt-12">
                {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order) => (
                        <OrderCard
                            key={order.orderID}
                            order={order}
                            onUpdateClick={handleUpdateClick}
                            onDeleteClick={handleDeleteProduct}
                        />
                    ))
                ) : (
                    <div className="w-full text-center py-8">
                        <p className="text-gray-500 font-poppins-regular text-lg">No orders found matching your criteria.</p>
                    </div>
                )}
            </div>
            <div className="flex justify-center mt-[20px]">
                <Pagination
                    count={Math.ceil(filteredOrders.length / itemsPerPage)}
                    page={page}
                    onChange={handleChange}
                    color="primary"
                />
            </div>
                </>
            )}
        </div>
    );
};

export default ConsumerOrderList;