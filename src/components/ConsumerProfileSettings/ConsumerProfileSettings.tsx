"use client"

import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getWithExpiry } from "../../../auth-utils"; // Update the path to where you store auth-utils.js
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfileSettingsPage = () => {
    const [currentStep, setCurrentStep] = useState(1); // Step 1: Categories, Step 2: Personal Details
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [sessionValid, setSessionValid] = useState(true);

    // State for user categories
    const [categoriesForm, setCategoriesForm] = useState({
        aboutMe: "",
        categoryOne: "",
        categoryTwo: "",
        categoryThree: "",
        categoryFour: "",
        categoryFive: "",
    });

    // State for personal details
    const [detailsForm, setDetailsForm] = useState({
        userFirstName: "",
        userLastName: "",
        mobile: "",
        address: "",
        city: "",
        country: "",
        postalCode: "",
    });

    // Available category options - update these with your actual category options
    const categoryOptions = {
        categoryOne: ["Vegetables", "Fruits", "Cereals", "Seeds", "Fertilizer"],
        categoryTwo: ["Vegetables", "Fruits", "Cereals", "Seeds", "Fertilizer"],
        categoryThree: ["Vegetables", "Fruits", "Cereals", "Seeds", "Fertilizer"],
        categoryFour: ["Vegetables", "Fruits", "Cereals", "Seeds", "Fertilizer"],
        categoryFive: ["Vegetables", "Fruits", "Cereals", "Seeds", "Fertilizer"]
    };

    // Check if the user session is valid
    useEffect(() => {
        const checkSession = () => {
            const userID = getWithExpiry('userID');
            if (!userID) {
                setSessionValid(false);
                toast.error("Your session has expired. Please log in again.");
                setIsLoading(false);
            }
        };

        checkSession();
    }, [sessionValid]);

    useEffect(() => {
        // Don't fetch data if session is invalid
        if (!sessionValid) {
            return;
        }

        const fetchUserData = async () => {
            try {
                // Get userID from session storage
                const userID = getWithExpiry('userID');
                const token = getWithExpiry('token'); // Add this if your API uses token authentication

                // Enhanced debugging to identify session issues
                console.log("Session check:", {
                    userID: userID ? "Present" : "Missing",
                    token: token ? "Present" : "Missing",
                    userIDValue: userID
                });

                if (!userID) {
                    throw new Error("User ID not found in session. Please log in again.");
                }

                console.log("Fetching user data with userID:", userID);

                // Set up request headers with authentication if needed
                const headers = {
                    "Content-Type": "application/json"
                };

                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                // Fetch user categories
                try {
                    const categoriesResponse = await fetch(
                        `http://localhost:8081/api/user/viewUserCategories/${userID}`,
                        {
                            headers: headers,
                            credentials: 'include' // Include cookies if your API uses cookie-based sessions
                        }
                    );

                    if (!categoriesResponse.ok) {
                        console.warn(`Categories API returned status: ${categoriesResponse.status}`);
                    } else {
                        const categoriesData = await categoriesResponse.json();
                        console.log("Categories data response:", categoriesData);

                        // Handle successful response with data
                        if (categoriesData.status === "200" || categoriesData.status === 200) {
                            if (categoriesData.userCategoriesGetResponse &&
                                Array.isArray(categoriesData.userCategoriesGetResponse) &&
                                categoriesData.userCategoriesGetResponse.length > 0) {

                                const categoryData = categoriesData.userCategoriesGetResponse[0] || {};

                                setCategoriesForm({
                                    aboutMe: categoryData.aboutMe || "",
                                    categoryOne: categoryData.categoryOne || "",
                                    categoryTwo: categoryData.categoryTwo || "",
                                    categoryThree: categoryData.categoryThree || "",
                                    categoryFour: categoryData.categoryFour || "",
                                    categoryFive: categoryData.categoryFive || "",
                                });
                            } else {
                                console.log("No categories data found or empty response. Using default empty values.");
                                // Already initialized with empty strings in useState
                            }
                        } else {
                            console.log("Categories API returned non-200 status:", categoriesData.status);
                        }
                    }
                } catch (err) {
                    console.error("Error fetching user categories:", err);
                    // Don't throw here - continue to fetch user details
                }

                // Fetch user details
                try {
                    const detailsResponse = await fetch(
                        `http://localhost:8081/api/user/viewUserDetails/${userID}`,
                        {
                            headers: headers,
                            credentials: 'include' // Include cookies if your API uses cookie-based sessions
                        }
                    );

                    if (!detailsResponse.ok) {
                        console.warn(`User details API returned status: ${detailsResponse.status}`);
                    } else {
                        const detailsData = await detailsResponse.json();
                        console.log("User details data response:", detailsData);

                        // Handle successful response with data
                        if (detailsData.status === "200" || detailsData.status === 200) {
                            if (detailsData.userDetailsGetResponse &&
                                Array.isArray(detailsData.userDetailsGetResponse) &&
                                detailsData.userDetailsGetResponse.length > 0) {

                                const userDetailsData = detailsData.userDetailsGetResponse[0];

                                setDetailsForm({
                                    userFirstName: userDetailsData.userFirstName || userDetailsData.user?.firstName || "",
                                    userLastName: userDetailsData.userLastName || userDetailsData.user?.lastName || "",
                                    mobile: userDetailsData.mobile || "",
                                    address: userDetailsData.address || "",
                                    city: userDetailsData.city || "",
                                    country: userDetailsData.country || "",
                                    postalCode: userDetailsData.postalCode || "",
                                });
                            } else {
                                console.log("No user details found or empty response. Using default empty values.");
                                // Already initialized with empty strings in useState
                            }
                        } else {
                            console.log("User details API returned non-200 status:", detailsData.status);
                        }
                    }
                } catch (err) {
                    console.error("Error fetching user details:", err);
                    // Don't throw here - continue with default values
                }

            } catch (err) {
                console.error("Error in fetchUserData:", err);
                toast.error(err.message || "Failed to load profile data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Handle changes to categories form
    const handleCategoriesChange = (e) => {
        const { name, value } = e.target;
        setCategoriesForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle changes to details form
    const handleDetailsChange = (e) => {
        const { name, value } = e.target;
        setDetailsForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Save categories and proceed to next step
    const saveCategories = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const userID = getWithExpiry('userID');
            if (!userID) {
                throw new Error("User ID not found in session. Please log in again.");
            }

            // Get authentication token if your API uses it
            const token = getWithExpiry('token'); // Add this if your API uses token authentication

            console.log("Sending categories with userID:", userID);

            // Prepare the request payload according to your API expectations
            const requestBody = {
                userID: userID,
                aboutMe: categoriesForm.aboutMe,
                categoryOne: categoriesForm.categoryOne,
                categoryTwo: categoriesForm.categoryTwo,
                categoryThree: categoriesForm.categoryThree,
                categoryFour: categoriesForm.categoryFour,
                categoryFive: categoriesForm.categoryFive
            };

            console.log("Request body:", JSON.stringify(requestBody));

            const response = await fetch("http://localhost:8081/api/user/userCategories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : "", // Add this if your API uses token authentication
                },
                body: JSON.stringify(requestBody),
                credentials: 'include' // Include cookies if your API uses cookie-based sessions
            });

            // Log the raw response for debugging
            const responseText = await response.text();
            console.log("Raw API response:", responseText);

            // Parse the response if it's valid JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse response as JSON:", e);
                throw new Error("Invalid response from server");
            }

            if (data.status === "200" || data.status === 200) {
                toast.success("Categories saved successfully!");
                // Move to next step
                setCurrentStep(2);
            } else {
                throw new Error(data.message || "Failed to save categories");
            }
        } catch (err) {
            console.error("Error saving categories:", err);
            toast.error(err.message || "Failed to save categories. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Save personal details
    const saveDetails = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const userID = getWithExpiry('userID');
            if (!userID) {
                throw new Error("User ID not found in session. Please log in again.");
            }

            // Get authentication token if your API uses it
            const token = getWithExpiry('token'); // Add this if your API uses token authentication

            console.log("Sending personal details with userID:", userID);

            // Prepare the request payload according to your API expectations
            const requestBody = {
                userID: userID,
                userFirstName: detailsForm.userFirstName,
                userLastName: detailsForm.userLastName,
                mobile: detailsForm.mobile,
                address: detailsForm.address,
                city: detailsForm.city,
                country: detailsForm.country,
                postalCode: detailsForm.postalCode
            };

            console.log("Request body:", JSON.stringify(requestBody));

            const response = await fetch("http://localhost:8081/api/user/userDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : "", // Add this if your API uses token authentication
                },
                body: JSON.stringify(requestBody),
                credentials: 'include' // Include cookies if your API uses cookie-based sessions
            });

            // Log the raw response for debugging
            const responseText = await response.text();
            console.log("Raw API response:", responseText);

            // Parse the response if it's valid JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse response as JSON:", e);
                throw new Error("Invalid response from server");
            }

            if (data.status === "200" || data.status === 200) {
                toast.success("Personal details saved successfully!");
                // Redirect back to profile page after short delay
                setTimeout(() => {
                    window.location.href = "/consumerProfile";
                }, 1500);
            } else {
                throw new Error(data.message || "Failed to save personal details");
            }
        } catch (err) {
            console.error("Error saving personal details:", err);
            toast.error(err.message || "Failed to save personal details. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // If still loading, show loading indicator
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-600">Loading profile data...</div>
                <ToastContainer position="top-right" autoClose={5000} />
            </div>
        );
    }

    return (
        <div className="bg-gray-100 p-6 mt-[70px]">
            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-lg">
                {/* Green Header */}
                <div className="bg-[#88C34E] p-6 relative">
                    <div className="flex items-center">
                        <div>
                            <h1 className="text-3xl font-poppins-bold text-white">Profile Settings</h1>
                            <p className="text-white font-poppins-regular text-opacity-90">
                                Step {currentStep} of 2: {currentStep === 1 ? "About Me & Categories" : "Personal Details"}
                            </p>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="absolute top-6 right-6">
                        <Link
                            href="/consumerProfile"
                            className="flex items-center font-poppins-regular bg-black text-white px-4 py-2 rounded-full"
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            Back to Profile
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                    {/* Step 1: About Me & Categories Form */}
                    {currentStep === 1 && (
                        <form onSubmit={saveCategories}>
                            <div className="mb-8">
                                <h2 className="text-2xl font-poppins-bold mb-4">About Me</h2>
                                <textarea
                                    name="aboutMe"
                                    value={categoriesForm.aboutMe}
                                    onChange={handleCategoriesChange}
                                    className="w-full h-40 p-4 font-poppins-regular border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88C34E]"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div className="mb-8">
                                <h2 className="text-2xl font-poppins-bold mb-4">Product Categories</h2>
                                <p className="text-gray-600 mb-4 font-poppins-regular">Select up to 5 categories that represent your interests</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.keys(categoryOptions).map((categoryKey, index) => (
                                        <div key={categoryKey} className="mb-4">
                                            <label className="block text-gray-700 mb-2 font-poppins-regular">Category {index + 1}</label>
                                            <select
                                                name={categoryKey}
                                                value={categoriesForm[categoryKey]}
                                                onChange={handleCategoriesChange}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88C34E] font-poppins-regular"
                                            >
                                                <option value="" className="font-poppins-regular">Select a category</option>
                                                {categoryOptions[categoryKey].map(option => (
                                                    <option key={option} value={option} className="font-poppins-regular">{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center bg-[#88C34E] text-white px-6 py-3 rounded-full font-poppins-bold disabled:bg-gray-400"
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Saving..." : "Save & Continue"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Personal Details Form */}
                    {currentStep === 2 && (
                        <form onSubmit={saveDetails}>
                            <div className="mb-8">
                                <h2 className="text-2xl font-poppins-bold mb-4">Personal Details</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-poppins-regular mb-2">First Name</label>
                                        <input
                                            type="text"
                                            name="userFirstName"
                                            value={detailsForm.userFirstName}
                                            onChange={handleDetailsChange}
                                            className="w-full p-3 border font-poppins-regular border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88C34E]"
                                            placeholder="First Name"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block font-poppins-regular font-poppins-regular text-gray-700 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            name="userLastName"
                                            value={detailsForm.userLastName}
                                            onChange={handleDetailsChange}
                                            className="w-full p-3 border border-gray-300 font-poppins-regular rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88C34E]"
                                            placeholder="Last Name"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block font-poppins-regular text-gray-700 mb-2">Mobile Number</label>
                                        <input
                                            type="text"
                                            name="mobile"
                                            value={detailsForm.mobile}
                                            onChange={handleDetailsChange}
                                            className="w-full p-3 border border-gray-300 font-poppins-regular rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88C34E]"
                                            placeholder="Mobile Number"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-poppins-regular mb-2">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={detailsForm.address}
                                            onChange={handleDetailsChange}
                                            className="w-full p-3 border border-gray-300 font-poppins-regular rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88C34E]"
                                            placeholder="Address"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-poppins-regular mb-2">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={detailsForm.city}
                                            onChange={handleDetailsChange}
                                            className="w-full p-3 border border-gray-300 font-poppins-regular rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88C34E]"
                                            placeholder="City"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-poppins-regular mb-2">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={detailsForm.country}
                                            onChange={handleDetailsChange}
                                            className="w-full p-3 border border-gray-300 font-poppins-regular rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88C34E]"
                                            placeholder="Country"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-poppins-regular mb-2">Postal Code</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={detailsForm.postalCode}
                                            onChange={handleDetailsChange}
                                            className="w-full p-3 border font-poppins-regular border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88C34E]"
                                            placeholder="Postal Code"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    className="flex items-center font-poppins-bold bg-gray-300 text-gray-800 px-6 py-3 rounded-full font-bold"
                                    onClick={() => setCurrentStep(1)}
                                >
                                    Back to Categories
                                </button>

                                <button
                                    type="submit"
                                    className="flex items-center bg-[#88C34E] font-poppins-bold text-white px-6 py-3 rounded-full disabled:bg-gray-400"
                                    disabled={isSaving}
                                >
                                    <Save size={18} className="mr-2" />
                                    {isSaving ? "Saving..." : "Save Details"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsPage;