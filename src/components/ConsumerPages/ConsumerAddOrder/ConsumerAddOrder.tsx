'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import axios from "axios";
import {toast} from "react-toastify";
import Camera from "../../../../public/Images/HeaderNav/icons8-camera-50.png"
import Logout from "../../../../public/Images/HeaderNav/icons8-logout-50.png";
import AddOrder from "../../../../public/Images/HeaderNav/Product quality-amico.svg"
import AddOffer from "../../../../public/Images/HeaderNav/Combo offer-rafiki.svg"

const ConsumerOrderDashboard: React.FC = () => {
    // State for managing form display
    const [currentStep, setCurrentStep] = useState(1);
    const [orderId, setOrderId] = useState<string | null>(null);

    // Image handling state
    const [image, setImage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    // Order form data
    const [formData, setFormData] = useState({
        productName: "",
        productImage: "",
        price: "",
        requiredQuantity: "",
        requiredTime: "",
        description: "",
        addedDate: "",
        productCategory: "",
    });

    // Offer form data
    const [offerFormData, setOfferFormData] = useState({
        offerName: "",
        newPrice: "",
        offerDescription: "",
    });

    // Handle image selection
    const handleImageClick = () => {
        document.getElementById("fileInput")?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);

            // Create preview URL
            const imageUrl = URL.createObjectURL(selectedFile);
            setImage(imageUrl);
        }
    };

    // Upload image function
    const uploadImage = async () => {
        if (!file) {
            toast.error('Please select an image first', {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append("productImage", file);

            // Add the orderId if available to link the image to the order
            if (orderId) {
                formData.append("orderId", orderId);
            }

            const response = await axios.post(
                "http://localhost:8081/api/user/cAddOrderProductImage",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true
                }
            );

            console.log("Image upload success:", response.data);

            toast.success('Order image uploaded successfully!', {
                position: "top-right",
                autoClose: 5000,
            });

            // Reset image form and move to step 3
            setImage(null);
            setFile(null);
            setCurrentStep(3);

        } catch (error) {
            console.error("Upload failed:", error);
            toast.error('Error uploading image. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    // Handle order form changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle offer form changes
    const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setOfferFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Submit order details
    const handleSubmitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const OrderData = {
            productName: formData.productName,
            price: formData.price,
            requiredQuantity: formData.requiredQuantity,
            requiredTime: formData.requiredTime,
            description: formData.description,
            addedDate: formData.addedDate,
            productCategory: formData.productCategory,
        };

        console.log("Submitting order data:", OrderData);

        try {
            const response = await axios.post(
                "http://localhost:8081/api/user/consumerAddOrders",
                OrderData,
                { withCredentials: true }
            );

            console.log('Order saved:', response.data);

            // Save the order ID to use for image upload
            if (response.data && response.data.id) {
                setOrderId(response.data.id);
            }

            toast.success('Order details saved! Now you can add an image.', {
                position: "top-right",
                autoClose: 5000,
            });

            // Switch to image upload form (step 2)
            setCurrentStep(2);

        } catch (error) {
            console.error('Error saving order:', error);
            toast.error('Failed to add order. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    // Submit offer form
    const handleSubmitOffer = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const OfferData = {
            offerName: offerFormData.offerName,
            newPrice: offerFormData.newPrice,
            offerDescription: offerFormData.offerDescription,
        };

        try {
            const OfferResponse = await axios.post(
                "http://localhost:8081/api/user/consumerOffers",
                OfferData,
                { withCredentials: true }
            );

            console.log('Offer saved:', OfferResponse.data);

            setOfferFormData({
                offerName: "",
                newPrice: "",
                offerDescription: "",
            });

            toast.success('Offer added successfully!', {
                position: "top-right",
                autoClose: 5000,
            });

            // Reset to step 1 after adding an offer
            setCurrentStep(1);
            setFormData({
                productName: "",
                productImage: "",
                price: "",
                requiredQuantity: "",
                requiredTime: "",
                description: "",
                addedDate: "",
                productCategory: "",
            });

        } catch (error) {
            console.error('Error saving offer:', error);
            toast.error('Failed to add offer. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="flex gap-6">
                        {/* Left side illustration for Step 1 */}


                        {/* Order Details Form - Step 1 */}
                        <form onSubmit={handleSubmitOrder} className="flex-1 ml-[-70px]">
                            <div className="bg-white p-6 w-[815px] rounded-xl shadow-lg flex-1 relative">
                                {/* Step Indicator */}
                                <div className="absolute top-4 left-4 flex items-center">
                                    <div className="bg-[#88C34E] text-white rounded-full w-8 h-8 flex items-center justify-center font-poppins-regular">
                                        1
                                    </div>
                                    <p className="ml-2 font-poppins-regular">Step 1 of 3 : Add Order Details</p>
                                </div>

                                <h2 className="text-xl font-poppins-bold mb-6 text-center mt-8">Add Your Order Details</h2>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <input
                                        type="text"
                                        placeholder="Product Name"
                                        name="productName"
                                        value={formData.productName}
                                        onChange={handleChange}
                                        className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
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
                                        placeholder="Price (willing to pay)"
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
                                        placeholder="Required Time (e.g., 3 days, 1 week)"
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

                                <button
                                    type="submit"
                                    className="w-full h-[45px] mt-[40px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-[#88C34E] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300"
                                >
                                    Next: Add Order Image
                                </button>
                            </div>
                        </form>
                        <div className="w-32 flex flex-col items-center justify-center ">
                            <div className="w-64 h-[460px] bg-[#B3FDBB] rounded-xl shadow-md flex items-center justify-center p-4 ">
                                <Image src={AddOrder} alt="Add Order"  className="max-w-full max-h-full  relative mb-[-210px] " />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    // Image Upload Form - Step 2
                    <div className="bg-white p-6 rounded-xl shadow-lg flex-1 relative max-w-lg mx-auto">
                        {/* Step Indicator */}
                        <div className="absolute top-4 left-4 flex items-center">
                            <div className="bg-[#88C34E] text-white rounded-full w-8 h-8 flex items-center justify-center font-poppins-regular">
                                2
                            </div>
                            <span className="ml-2 font-poppins-regular">Step 2 of 3 : Add Order Image</span>
                        </div>

                        <h2 className="text-xl font-poppins-bold mb-6 text-center mt-8">Add Order Image</h2>

                        <div className="flex justify-center mb-6">
                            <div
                                className="bg-gray-200 p-6 bg-white border shadow-md shadow-gray-300 focus:ring-2 focus:ring-[#5C8F2B] rounded-lg flex flex-col items-center justify-center cursor-pointer w-64 h-64"
                                onClick={handleImageClick}
                            >
                                {image ? (
                                    <img src={image} alt="Selected Product" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <>
                                        <Image src={Camera} alt="Camera" width={45} height={45} className="mb-4" />
                                        <p className="text-gray-600 font-poppins-regular">Click to select product image</p>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                id="fileInput"
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentStep(1);
                                    setImage(null);
                                    setFile(null);
                                }}
                                className="w-1/2 h-[45px] mt-[20px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-[20px] transition duration-300"
                            >
                                Back to Step 1
                            </button>

                            <button
                                type="button"
                                onClick={uploadImage}
                                className="w-1/2 h-[45px] mt-[20px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-[#88C34E] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300"
                            >
                                Next: Add Offer
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="flex gap-6">
                        {/* Left side illustration for Step 3 */}
                        <div className="w-32 flex flex-col items-center justify-center">
                            <div className="w-64 h-[470px] bg-[#B3FDBB] rounded-xl shadow-md flex items-center justify-center p-4">
                                <Image src={AddOffer} alt="Add Offer" className="max-w-full max-h-full mb-[-250px]" />
                            </div>

                        </div>

                        {/* Offers Form - Step 3 */}
                        <form onSubmit={handleSubmitOffer} className="flex-1 mr-[-70px]">
                            <div className="bg-white p-6 rounded-xl shadow-lg relative">
                                {/* Step Indicator */}
                                <div className="absolute top-4 left-4 flex items-center">
                                    <div className="bg-[#88C34E] text-white rounded-full w-8 h-8 flex items-center justify-center font-poppins-regular">
                                        3
                                    </div>
                                    <span className="ml-2 font-poppins-regular">Step 3 of 3 : Add Special Offer</span>
                                </div>

                                <h2 className="text-xl font-poppins-bold mb-6 text-center mt-8">Add Special Offer</h2>

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
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        className="w-1/2 h-[45px] mt-[20px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-[20px] transition duration-300"
                                    >
                                        Back to Step 2
                                    </button>

                                    <button
                                        type="submit"
                                        className="w-1/2 h-[45px] mt-[20px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-[#88C34E] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300"
                                    >
                                        Complete
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen ml-[4px] pt-[92px]">
            {/* Progress Bar */}
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
                        <span className="ml-2 font-poppins-regular">Upload Image</span>
                    </div>
                    <div className={`h-1 w-64 ${currentStep >= 3 ? 'bg-[#88C34E]' : 'bg-gray-300'}`}></div>
                    <div className="flex items-center">
                        <div className={`rounded-full w-10 h-10 flex items-center justify-center font-poppins-regular ${currentStep >= 3 ? 'bg-[#88C34E] text-white' : 'bg-gray-300 text-gray-600'}`}>
                            3
                        </div>
                        <span className="ml-2 font-poppins-regular">Add Offer</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {renderStepContent()}
            </div>
        </div>
    );
}

export default ConsumerOrderDashboard;