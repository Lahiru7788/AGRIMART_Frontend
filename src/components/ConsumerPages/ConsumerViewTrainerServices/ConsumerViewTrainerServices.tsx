"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination } from "@mui/material";
import Image from "next/image";
import {toast} from "react-toastify";
import { getWithExpiry } from "../../../../auth-utils";
import { useRouter } from "next/navigation";

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
                    placeholder="Search trainers"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-14 pr-4 py-2 w-[280px] bg-white font-poppins-regular border-none shadow-md rounded-full focus:ring-2 focus:ring-[#88C34E] outline-none"
                />
            </div>
        </div>
    );
};

const HiringCard = ({ hiring, onUpdateClick }) => {
    const [showOfferDetails, setShowOfferDetails] = useState(false);
    const [offerDetails, setOfferDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showHireConfirm, setShowHireConfirm] = useState(false);
    const [showPayConfirm, setShowPayConfirm] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [consumerHireStatus, setConsumerHireStatus] = useState(null);
    const [isHired, setIsHired] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const router = useRouter();

    // Toggle confirmation popups
    const toggleHireConfirm = () => {
        setShowHireConfirm(!showHireConfirm);
    };

    const togglePayConfirm = () => {
        setShowPayConfirm(!showPayConfirm);
    };

    // Handle hire now functionality
    const handleHireNow = async () => {
        try {
            const userID = getWithExpiry("userID");
            if (!userID) {
                toast.error('Please login to hire a trainer!');
                return;
            }

            // Get the current price (considering offers)
            let currentPrice = hiring.price;
            if (hiring.hasOffer && offerDetails) {
                currentPrice = offerDetails.newPrice;
            }

            const hireData = {
                hireID: hiring.hireID,
                name: hiring.name,
                price: currentPrice,
                yearsOfExperience: hiring.yearsOfExperience,
                addedDate: hiring.addedDate
            };

            const response = await axios.post(
                'http://localhost:8081/api/user/consumerHire',
                hireData,
                { withCredentials: true }
            );

            console.log('Hire response:', response.data); // Debug log

            // Close the confirmation popup
            toggleHireConfirm();

            // Show success message
            toast.success('Hiring request sent successfully! Wait for trainer confirmation.', {
                position: "top-right",
                autoClose: 5000,
            });

            // Update the hiring status immediately to show pending state
            setIsHired(true);
            setIsConfirmed(false);
            setIsPaid(false);

            // Wait a moment then check the status to get the actual hire record
            setTimeout(async () => {
                await checkConsumerHireStatus();
            }, 1000);

        } catch (error) {
            console.error("Error sending hire request:", error);
            toast.error('Failed to send hiring request. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    // Handle pay now functionality
    const handlePayNow = async () => {
        try {
            // Here you would implement the payment logic
            // For now, just show success message and update the paid status
            togglePayConfirm();

            toast.success('Payment processed successfully!', {
                position: "top-right",
                autoClose: 5000,
            });

            // Update the paid status
            setIsPaid(true);

        } catch (error) {
            console.error("Error processing payment:", error);
            toast.error('Payment failed. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    // Check consumer hire status using the new API
    const checkConsumerHireStatus = async () => {
        try {
            const userID = getWithExpiry("userID");
            if (!userID) return;

            const response = await axios.get(
                `http://localhost:8081/api/user/viewConsumerHire/${hiring.hireID}`,
                { withCredentials: true }
            );

            console.log('Consumer hire status response:', response.data); // Debug log

            const consumerHires = response.data.consumerHireGetResponse || [];

            // Find the hire record that matches this hiring's hireID in the trainerHiring object
            const currentHire = consumerHires.find(hire =>
                hire.trainerHiring && hire.trainerHiring.hireID === hiring.hireID
            );

            console.log('Found current hire:', currentHire); // Debug log

            if (currentHire) {
                setConsumerHireStatus(currentHire);
                setIsHired(true);
                setIsConfirmed(currentHire.confirmed === true);
                setIsPaid(currentHire.paid === true);
                console.log('Updated state - isHired:', true, 'isConfirmed:', currentHire.confirmed, 'isPaid:', currentHire.paid); // Debug log
            } else {
                // No hire record found, reset states
                setConsumerHireStatus(null);
                setIsHired(false);
                setIsConfirmed(false);
                setIsPaid(false);
                console.log('No hire record found, reset states'); // Debug log
            }

        } catch (error) {
            console.error("Error checking consumer hire status:", error);
            // If there's an error (like 404), assume not hired
            setConsumerHireStatus(null);
            setIsHired(false);
            setIsConfirmed(false);
        }
    };

    useEffect(() => {
        // Fetch offer details if available
        if (hiring.hasOffer) {
            fetchOfferDetails();
        }
        // Fetch profile image
        fetchProfileImage();
        // Check consumer hire status on component mount
        checkConsumerHireStatus();
    }, [hiring.hireID]);

    // Add a separate useEffect to periodically check hire status
    useEffect(() => {
        const interval = setInterval(() => {
            if (isHired && (!isConfirmed || (isConfirmed && !isPaid))) {
                console.log('Checking hire status - isHired:', isHired, 'isConfirmed:', isConfirmed, 'isPaid:', isPaid); // Debug log
                checkConsumerHireStatus();
            }
        }, 5000); // Check every 5 seconds if hired but not confirmed, or confirmed but not paid

        return () => clearInterval(interval);
    }, [isHired, isConfirmed, isPaid, hiring.hireID]);

    const fetchProfileImage = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewUserProfile?userID=${hiring.user.userID}`,
                { responseType: "blob" }
            );
            const imageUrl = URL.createObjectURL(response.data);
            setProfileImage(imageUrl);
        } catch (error) {
            console.error("Error fetching profile image:", error);
        }
    };

    const fetchOfferDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewTrainerHiringOffersByHireId/${hiring.hireID}`
            );

            // Access the correct part of the response structure
            if (response.data.trainerHiringOfferGetResponse &&
                response.data.trainerHiringOfferGetResponse.length > 0) {
                setOfferDetails(response.data.trainerHiringOfferGetResponse[0]);
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

    const handleProfileClick = () => {
        // Pass the trainer's userID as a query parameter
        router.push(`/consumerViewTrainerProfile?userID=${hiring.user.userID}`);
    };

    // Determine card shadow based on hiring status - UPDATED LOGIC
    const getCardShadowClass = () => {
        if (isHired && isConfirmed && isPaid) {
            // Paid - back to normal shadow (cycle complete)
            return "bg-white shadow-md rounded-[20px] p-4 w-80 relative";
        } else if (isHired && isConfirmed && !isPaid) {
            // Confirmed but not paid - green shadow (Pay Now enabled)
            return "bg-white shadow-md shadow-[#88C34E] border rounded-[20px] p-4 w-80 relative";
        } else if (isHired && !isConfirmed) {
            // Hired but pending confirmation - red shadow
            return "bg-white shadow-md shadow-red-500 border rounded-[20px] p-4 w-80 relative";
        } else if (hiring.hasOffer) {
            // Has offer but not hired - green shadow
            return "bg-white shadow-md shadow-[#88C34E] border rounded-[20px] p-4 w-80 relative";
        } else {
            // Default shadow (not hired, no offer)
            return "bg-white shadow-md rounded-[20px] p-4 w-80 relative";
        }
    };

    return (
        <div className={`${getCardShadowClass()} w-[320px] ml-[8px] mt-[10px] p-3 pt-16`}>
            {hiring.hasOffer && (
                <div
                    className="absolute top-2 text-center right-2 bg-[#88C34E] font-poppins-regular text-white px-2 py-1 rounded-lg cursor-pointer text-sm hover:bg-red-500 transition-colors"
                    onClick={toggleOfferDetails}
                >
                    Offer <br/> Available
                </div>
            )}

            {/* Hiring Status Indicator */}
            {isHired && (
                <div className={`absolute top-2 left-2 font-poppins-regular text-white px-2 py-1 rounded-lg text-xs ${
                    isPaid ? 'bg-blue-500' : isConfirmed ? 'bg-green-500' : 'bg-orange-500'
                }`}>
                    {isPaid ? 'Paid' : isConfirmed ? 'Confirmed' : 'Pending'}
                </div>
            )}

            {/* Profile Image positioned to extend outside the card */}
            <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 z-10">
                <div
                    className="w-24 h-24 rounded-full border-4 border-[#88C34E] overflow-hidden cursor-pointer hover:border-[#7AB33D] transition-colors bg-white"
                    onClick={handleProfileClick}
                >
                    {profileImage ? (
                        <Image
                            src={profileImage}
                            alt={hiring.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                    )}
                </div>
            </div>

            <h2 className="text-gray-600 font-poppins-bold mt-4">
                Hire ID #{hiring.hireID}
            </h2>
            <p className="text-gray-400 font-poppins-regular text-sm">
                {new Date(hiring.addedDate).toLocaleDateString()}
            </p>
            <h3 className="text-lg font-poppins-bold text-center">
                {hiring.name}
            </h3>

            {/* Years of Experience - Left/Right Layout */}
            <div className="flex justify-between items-center my-2">
                <p className="text-gray-600 font-poppins-bold">Experience:</p>
                <p className="text-[#88C34E] font-poppins-bold">{hiring.yearsOfExperience} years</p>
            </div>

            {/* Price - Left/Right Layout */}
            <div className="flex justify-between items-center my-2">
                <p className="text-gray-600 font-poppins-bold">Hourly Rate:</p>
                {hiring.hasOffer ? (
                    <div className="text-right">
                        {isLoading ? (
                            <p className="text-gray-500">Loading...</p>
                        ) : offerDetails ? (
                            <div className="flex items-center">
                                <span className="line-through mr-2 text-[#88C34E] font-poppins-bold">Rs. {hiring.price}</span>
                                <span className="text-red-600 font-poppins-bold">Rs. {offerDetails.newPrice}</span>
                            </div>
                        ) : (
                            <p className=" text-[#88C34E] font-poppins-bold">Rs. {hiring.price}</p>
                        )}
                    </div>
                ) : (
                    <p className=" text-[#88C34E] font-poppins-bold">Rs. {hiring.price}</p>
                )}
            </div>

            {/* Qualifications - Left/Right Layout */}
            <div className="mt-2">
                <p className="text-gray-600 font-poppins-bold mb-1">Qualifications:</p>
                <div className="bg-gray-100 rounded-lg p-2 h-[71px] overflow-y-auto">
                    <p className="text-gray-700 font-poppins-regular">
                        {hiring.qualifications}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-2 pt-2 border-t border-gray-300 gap-2">
                <button
                    className={`flex-1 py-2 px-4 rounded-lg font-poppins-bold text-sm transition-colors ${
                        (!isHired || isPaid)
                            ? 'bg-[#88C34E] hover:bg-[#7AB33D] text-white'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                    onClick={(!isHired || isPaid) ? toggleHireConfirm : null}
                    disabled={isHired && !isPaid}
                >
                    {isPaid ? 'Hire Again' : isHired ? 'Hired' : 'Hire Now'}
                </button>
                <button
                    className={`flex-1 py-2 px-4 rounded-lg font-poppins-bold text-sm transition-colors ${
                        (isHired && isConfirmed && !isPaid)
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                    onClick={(isHired && isConfirmed && !isPaid) ? togglePayConfirm : null}
                    disabled={!(isHired && isConfirmed && !isPaid)}
                >
                    {isPaid ? 'Paid' : 'Pay Now'}
                </button>
            </div>

            {/* Rest of the component remains the same... */}
            {/* Hire Confirmation Popup */}
            {showHireConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={toggleHireConfirm}>
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-poppins-bold text-[#88C34E]">Confirm Hiring</h3>
                            <button
                                onClick={toggleHireConfirm}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 font-poppins-regular">
                                Are you sure you want to hire <span className="font-poppins-bold">{hiring.name}</span>?
                            </p>
                            <div className="mt-4 bg-gray-100 rounded p-3">
                                <p className="text-sm"><strong>Trainer:</strong> {hiring.name}</p>
                                <p className="text-sm"><strong>Experience:</strong> {hiring.yearsOfExperience} years</p>
                                <p className="text-sm"><strong>Rate:</strong> Rs. {hiring.hasOffer && offerDetails ? offerDetails.newPrice : hiring.price}/hour</p>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">
                                The trainer will need to accept your request before you can proceed with payment.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                className="w-1/2 bg-gray-400 hover:bg-gray-500 text-white font-poppins-bold py-2 rounded-lg transition-colors"
                                onClick={toggleHireConfirm}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-1/2 bg-[#88C34E] hover:bg-[#7AB33D] text-white font-poppins-bold py-2 rounded-lg transition-colors"
                                onClick={handleHireNow}
                            >
                                Yes, Hire
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pay Confirmation Popup */}
            {showPayConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={togglePayConfirm}>
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-poppins-bold text-blue-600">Confirm Payment</h3>
                            <button
                                onClick={togglePayConfirm}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 font-poppins-regular">
                                Proceed with payment for <span className="font-poppins-bold">{hiring.name}</span>?
                            </p>
                            <div className="mt-4 bg-gray-100 rounded p-3">
                                <p className="text-sm"><strong>Trainer:</strong> {hiring.name}</p>
                                <p className="text-sm"><strong>Amount:</strong> Rs. {hiring.hasOffer && offerDetails ? offerDetails.newPrice : hiring.price}/hour</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                className="w-1/2 bg-gray-400 hover:bg-gray-500 text-white font-poppins-bold py-2 rounded-lg transition-colors"
                                onClick={togglePayConfirm}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-poppins-bold py-2 rounded-lg transition-colors"
                                onClick={handlePayNow}
                            >
                                Pay Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup Overlay for Offer Details */}
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
                                <span className="font-poppins-regular">Original Rate:</span>
                                <span className="line-through">Rs. {hiring.price}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="font-poppins-bold">Offer Rate:</span>
                                <span className="font-poppins-bold text-red-600">Rs. {offerDetails.newPrice}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="font-poppins-regular">Savings:</span>
                                <span className="text-green-600 font-poppins-bold">
                                    Rs. {(hiring.price - offerDetails.newPrice).toFixed(2)}
                                    ({((hiring.price - offerDetails.newPrice) / hiring.price * 100).toFixed(0)}% off)
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

const HiringList = () => {
    const [hirings, setHirings] = useState([]);
    const [filteredHirings, setFilteredHirings] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 3;
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState(["Agricultural Training", "Livestock Management", "Crop Cultivation"]);

    useEffect(() => {
        fetchHirings();
    }, []);

    useEffect(() => {
        // Apply both search and category filters
        filterHirings();
    }, [hirings, selectedCategory]);

    const filterHirings = (searchTerm = "") => {
        let filtered = [...hirings];

        // Filter by search term if provided
        if (searchTerm.trim()) {
            filtered = filtered.filter((hiring) =>
                hiring.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category if selected (you can add category field to hiring data if needed)
        if (selectedCategory) {
            filtered = filtered.filter(
                (hiring) => hiring.category === selectedCategory
            );
        }

        setFilteredHirings(filtered);
        // Reset to first page when filtering
        setPage(1);
    };

    const handleSearch = (searchTerm) => {
        filterHirings(searchTerm);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const fetchHirings = async () => {
        try {
            // Updated API endpoint to fetch all hires
            const response = await axios.get(
                'http://localhost:8081/api/user/viewAllHires'
            );

            const hiringList = response.data.trainerHiringGetResponse || [];

            // Filter out deleted hirings
            const activeHirings = hiringList.filter(hiring => hiring.deleted !== true);

            // Check offers for each hiring
            const hiringsWithOffers = await Promise.all(
                activeHirings.map(async (hiring) => {
                    let updatedHiring = { ...hiring, hasOffer: false };

                    // Check if hiring has offers
                    try {
                        const offerResponse = await axios.get(
                            `http://localhost:8081/api/user/viewTrainerHiringOffersByHireId/${hiring.hireID}`
                        );

                        // If offers array exists and has items, hiring has an offer
                        updatedHiring.hasOffer =
                            offerResponse.data.trainerHiringOfferGetResponse &&
                            offerResponse.data.trainerHiringOfferGetResponse.length > 0;
                    } catch (error) {
                        console.error(`Error checking offers for hiring ${hiring.hireID}:`, error);
                    }

                    return updatedHiring;
                })
            );

            setHirings(hiringsWithOffers);
            setFilteredHirings(hiringsWithOffers);

        } catch (error) {
            console.error("Error fetching hirings:", error);
        }
    };

    const handleChange = (event, value) => {
        setPage(value);
    };

    const paginatedHirings = filteredHirings.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="pt-[100px] p-6 bg-gray-100 min-h-screen relative">
            {/* Filters row */}
            <div className="flex justify-between items-center mb-6">
                <CategoryDropdown
                    onCategoryChange={handleCategoryChange}
                    categories={categories}
                />
                <SearchBar onSearch={handleSearch} />
            </div>

            <div className="flex flex-wrap gap-6 mt-12">
                {paginatedHirings.length > 0 ? (
                    paginatedHirings.map((hiring) => (
                        <HiringCard
                            key={hiring.hireID}
                            hiring={hiring}
                            onUpdateClick={() => {}}
                        />
                    ))
                ) : (
                    <div className="w-full text-center py-8">
                        <p className="text-gray-500 font-poppins-regular text-lg">No hiring services found matching your criteria.</p>
                    </div>
                )}
            </div>
            <div className="flex justify-center mt-[20px]">
                <Pagination
                    count={Math.ceil(filteredHirings.length / itemsPerPage)}
                    page={page}
                    onChange={handleChange}
                    color="primary"
                />
            </div>
        </div>
    );
};

export default HiringList;