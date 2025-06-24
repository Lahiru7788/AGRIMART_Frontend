'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from "axios";
import {toast} from "react-toastify";
import { useSearchParams } from 'next/navigation';
import { getWithExpiry } from "../../../../auth-utils";
import AddProduct from "../../../../public/Images/HeaderNav/Product quality-amico.svg"
import AddOffer from "../../../../public/Images/HeaderNav/Combo offer-rafiki.svg";

const TrainerHireDashboard: React.FC = () => {
    const searchParams = useSearchParams();
    const hireIdFromUrl = searchParams.get('hireID');

    // State for managing form display
    const [currentStep, setCurrentStep] = useState(1);
    const [hireId, setHireId] = useState<string | null>(hireIdFromUrl);
    const [isUpdateMode, setIsUpdateMode] = useState(!!hireIdFromUrl);
    const [isLoading, setIsLoading] = useState(false);

    // Hire service form data
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        yearsOfExperience: "",
        addedDate: "",
        qualifications: "",
    });

    // Offer form data
    const [offerFormData, setOfferFormData] = useState({
        offerName: "",
        newPrice: "",
        offerDescription: "",
    });

    // Fetch existing hire data when in update mode
    useEffect(() => {
        if (isUpdateMode && hireIdFromUrl) {
            fetchHireData(hireIdFromUrl);
            fetchOfferData(hireIdFromUrl);
        }
    }, [isUpdateMode, hireIdFromUrl]);

    // Fetch hire service data
    const fetchHireData = async (hireID: string) => {
        setIsLoading(true);
        try {
            const userID = getWithExpiry('userID');
            if (!userID) {
                toast.error('User ID not found. Please login again.', {
                    position: "top-right",
                    autoClose: 5000,
                });
                return;
            }

            const response = await axios.get(
                `http://localhost:8081/api/user/viewTrainerHiring/${userID}`,
                { withCredentials: true }
            );

            const hireServices = response.data.trainerHiringGetResponse;
            // Filter by deleted=false and find target hire service
            const activeHireServices = hireServices.filter((hire: any) => hire.deleted === false);
            const targetHire = activeHireServices.find((hire: any) => hire.hireID.toString() === hireID);

            if (targetHire) {
                // Format the date for input field
                const formattedDate = targetHire.addedDate
                    ? new Date(targetHire.addedDate).toISOString().split('T')[0]
                    : '';

                setFormData({
                    name: targetHire.name || "",
                    price: targetHire.price?.toString() || "",
                    yearsOfExperience: targetHire.yearsOfExperience?.toString() || "",
                    addedDate: formattedDate,
                    qualifications: targetHire.qualifications || "",
                });

                console.log('Hire service data loaded:', targetHire);
            } else {
                toast.error('Hire service not found.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } catch (error) {
            console.error('Error fetching hire service data:', error);
            toast.error('Error loading hire service data.', {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch offer data
    const fetchOfferData = async (hireID: string) => {
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewTrainerHiringOffersByHireId/${hireID}`,
                { withCredentials: true }
            );

            // Check if response has the correct structure
            if (response.data && response.data.trainerHiringOfferGetResponse && response.data.trainerHiringOfferGetResponse.length > 0) {
                // Filter by active=true and get first active offer
                const activeOffers = response.data.trainerHiringOfferGetResponse.filter((offer: any) => offer.active === true);
                if (activeOffers.length > 0) {
                    const offer = activeOffers[0];
                    setOfferFormData({
                        offerName: offer.offerName || "",
                        newPrice: offer.newPrice?.toString() || "",
                        offerDescription: offer.offerDescription || "",
                    });
                    console.log('Offer data loaded:', offer);
                }
            } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                // Fallback in case the response structure is different
                const activeOffers = response.data.filter((offer: any) => offer.active === true);
                if (activeOffers.length > 0) {
                    const offer = activeOffers[0];
                    setOfferFormData({
                        offerName: offer.offerName || "",
                        newPrice: offer.newPrice?.toString() || "",
                        offerDescription: offer.offerDescription || "",
                    });
                    console.log('Offer data loaded (fallback):', offer);
                }
            }
        } catch (error) {
            console.error('Error fetching offer data:', error);
            // Don't show error toast as offers might not exist yet
        }
    };

    // Handle hire service form changes
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

    // Submit hire service details (now handles both create and update)
    const handleSubmitHireService = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const HireServiceData = {
            ...(isUpdateMode && { hireID: hireId }), // Include hireID for updates
            name: formData.name,
            price: formData.price,
            yearsOfExperience: parseInt(formData.yearsOfExperience),
            addedDate: formData.addedDate,
            qualifications: formData.qualifications,
        };

        console.log("Submitting hire service data:", HireServiceData);

        try {
            const response = await axios.post(
                "http://localhost:8081/api/user/trainerHiring",
                HireServiceData,
                { withCredentials: true }
            );

            console.log('Hire service saved:', response.data);

            if (!isUpdateMode) {
                // For new hire services, extract hireID from response
                const extractedHireId = response.data?.hireID;

                if (extractedHireId) {
                    setHireId(extractedHireId.toString());
                    console.log('Hire ID set to:', extractedHireId);
                } else {
                    console.warn('No hire ID found in response:', response.data);
                    toast.error('Hire service saved but ID not found. Please try again.', {
                        position: "top-right",
                        autoClose: 5000,
                    });
                    return;
                }
            }

            toast.success(isUpdateMode ? 'Hire service updated successfully!' : 'Hire service details saved! Now you can add an offer.', {
                position: "top-right",
                autoClose: 5000,
            });

            // Switch to offer form (step 2)
            setCurrentStep(2);

        } catch (error) {
            console.error('Error saving hire service:', error);
            toast.error('Failed to save hire service. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    // Submit offer form
    const handleSubmitOffer = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!hireId) {
            toast.error('Hire ID is missing. Please complete the hire service creation process first.', {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        const OfferData = {
            hireId: hireId,
            offerName: offerFormData.offerName,
            newPrice: offerFormData.newPrice,
            offerDescription: offerFormData.offerDescription,
        };

        console.log("Submitting offer data with hireId:", OfferData);

        try {
            const OfferResponse = await axios.post(
                "http://localhost:8081/api/user/trainerHiringOffers",
                OfferData,
                { withCredentials: true }
            );

            console.log('Offer saved:', OfferResponse.data);

            toast.success(isUpdateMode ? 'Offer updated successfully!' : 'Offer added successfully!', {
                position: "top-right",
                autoClose: 5000,
            });

            if (!isUpdateMode) {
                // Reset forms for new hire services
                setOfferFormData({
                    offerName: "",
                    newPrice: "",
                    offerDescription: "",
                });

                setFormData({
                    name: "",
                    price: "",
                    yearsOfExperience: "",
                    addedDate: "",
                    qualifications: "",
                });

                // Reset to step 1 after adding an offer
                setCurrentStep(1);
            }

        } catch (error) {
            console.error('Error saving offer:', error);
            if (error.response?.status === 403) {
                toast.error('Session expired or unauthorized. Please refresh and try again.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            } else {
                toast.error('Failed to save offer. Please try again.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
    };

    const renderStepContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg font-poppins-regular">Loading hire service data...</div>
                </div>
            );
        }

        switch (currentStep) {
            case 1:
                return (
                    <div className="flex gap-6">
                        {/* Hire Service Details Form - Step 1 */}
                        <form onSubmit={handleSubmitHireService} className="flex-1 ml-[-70px]">
                            <div className="bg-white p-6 w-[815px] rounded-xl shadow-lg flex-1 relative">
                                {/* Step Indicator */}
                                <div className="absolute top-4 left-4 flex items-center">
                                    <div className="bg-[#88C34E] text-white rounded-full w-8 h-8 flex items-center justify-center font-poppins-regular">
                                        1
                                    </div>
                                    <p className="ml-2 font-poppins-regular">
                                        Step 1 of 2 : {isUpdateMode ? 'Update' : 'Add'} Hire Service Details
                                    </p>
                                </div>

                                <h2 className="text-xl font-poppins-bold mb-6 text-center mt-8">
                                    {isUpdateMode ? 'Update Your Hire Service Details' : 'Add Your Hire Service Details'}
                                </h2>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <input
                                        type="text"
                                        placeholder="Service Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                        required
                                    />

                                    <input
                                        type="number"
                                        placeholder="Price (per hour/day)"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="p-3 bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                        required
                                    />

                                    <input
                                        type="number"
                                        placeholder="Years of Experience"
                                        name="yearsOfExperience"
                                        value={formData.yearsOfExperience}
                                        onChange={handleChange}
                                        className="p-3 w-full bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
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

                                    <textarea
                                        placeholder="Qualifications & Skills"
                                        name="qualifications"
                                        value={formData.qualifications}
                                        onChange={handleChange}
                                        className="p-3 bg-white w-full col-span-2 border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
                                        rows={4}
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-[45px] mt-[40px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-[#88C34E] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300"
                                >
                                    Next: {isUpdateMode ? 'Update' : 'Add'} Special Offer
                                </button>
                            </div>
                        </form>

                        {/* Right side illustration for Step 1 */}
                        <div className="w-32 flex flex-col items-center justify-center ">
                            <div className="w-64 h-[460px] bg-[#B3FDBB] rounded-xl shadow-md flex items-center justify-center p-4 ">
                                <Image src={AddProduct} alt="Add Service" className="max-w-full max-h-full relative mb-[-210px] " />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="flex gap-6">
                        {/* Left side illustration for Step 2 */}
                        <div className="w-32 flex flex-col items-center justify-center">
                            <div className="w-64 h-[470px] bg-[#B3FDBB] rounded-xl shadow-md flex items-center justify-center p-4">
                                <Image src={AddOffer} alt="Add Offer" className="max-w-full max-h-full mb-[-250px]" />
                            </div>
                        </div>

                        {/* Offers Form - Step 2 */}
                        <form onSubmit={handleSubmitOffer} className="flex-1 mr-[-70px]">
                            <div className="bg-white p-6 rounded-xl shadow-lg relative">
                                {/* Step Indicator */}
                                <div className="absolute top-4 left-4 flex items-center">
                                    <div className="bg-[#88C34E] text-white rounded-full w-8 h-8 flex items-center justify-center font-poppins-regular">
                                        2
                                    </div>
                                    <span className="ml-2 font-poppins-regular">
                                        Step 2 of 2 : {isUpdateMode ? 'Update' : 'Add'} Special Offer
                                    </span>
                                </div>

                                <h2 className="text-xl font-poppins-bold mb-6 text-center mt-8">
                                    {isUpdateMode ? 'Update Special Offer' : 'Add Special Offer'}
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
                                        placeholder="New Price (Discounted)"
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
                                        onClick={() => setCurrentStep(1)}
                                        className="w-1/2 h-[45px] mt-[20px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-[20px] transition duration-300"
                                    >
                                        Back to Step 1
                                    </button>

                                    <button
                                        type="submit"
                                        className="w-1/2 h-[45px] mt-[20px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-[#88C34E] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300"
                                    >
                                        {isUpdateMode ? 'Update' : 'Complete'}
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
                        <span className="ml-2 font-poppins-regular">Hire Service Details</span>
                    </div>
                    <div className={`h-1 w-64 ${currentStep >= 2 ? 'bg-[#88C34E]' : 'bg-gray-300'}`}></div>
                    <div className="flex items-center">
                        <div className={`rounded-full w-10 h-10 flex items-center justify-center font-poppins-regular ${currentStep >= 2 ? 'bg-[#88C34E] text-white' : 'bg-gray-300 text-gray-600'}`}>
                            2
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

export default TrainerHireDashboard;