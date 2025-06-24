"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const FarmerProfilePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userID = searchParams.get('userID');

    const [userDetails, setUserDetails] = useState({
        userFirstName: "",
        userLastName: "",
        mobile: "",
        address: "",
        city: "",
        country: "",
        postalCode: "",
        email: "",
    });

    const [userCategories, setUserCategories] = useState({
        aboutMe: "",
        categoryOne: "",
        categoryTwo: "",
        categoryThree: "",
        categoryFour: "",
        categoryFive: "",
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        if (!userID) {
            setError("User ID not provided");
            setIsLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                // Fetch user details
                const detailsResponse = await axios.get(`http://localhost:8081/api/user/viewUserDetails/${userID}`);

                if (
                    detailsResponse.data.status === "200" &&
                    detailsResponse.data.userDetailsGetResponse &&
                    detailsResponse.data.userDetailsGetResponse.length > 0
                ) {
                    const userDetailsData = detailsResponse.data.userDetailsGetResponse[0];
                    setUserDetails({
                        userFirstName: userDetailsData.userFirstName || userDetailsData.user?.firstName || "",
                        userLastName: userDetailsData.userLastName || userDetailsData.user?.lastName || "",
                        mobile: userDetailsData.mobile || "",
                        address: userDetailsData.address || "",
                        city: userDetailsData.city || "",
                        country: userDetailsData.country || "",
                        postalCode: userDetailsData.postalCode || "",
                        email: userDetailsData.user?.userEmail || "",
                    });
                }

                // Fetch user categories
                const categoriesResponse = await axios.get(`http://localhost:8081/api/user/viewUserCategories/${userID}`);
                if (categoriesResponse.data?.status === "200" && categoriesResponse.data.userCategoriesGetResponse) {
                    const categoryData = categoriesResponse.data.userCategoriesGetResponse[0] || {};
                    setUserCategories({
                        aboutMe: categoryData.aboutMe || "",
                        categoryOne: categoryData.categoryOne || "",
                        categoryTwo: categoryData.categoryTwo || "",
                        categoryThree: categoryData.categoryThree || "",
                        categoryFour: categoryData.categoryFour || "",
                        categoryFive: categoryData.categoryFive || "",
                    });
                }

                // Fetch user profile image
                await fetchProfileImage(userID);
            } catch (err) {
                setError(err.message || "Failed to load profile data");
                console.error("Error fetching profile data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [userID]);

    const fetchProfileImage = async (userID) => {
        try {
            const timestamp = new Date().getTime();
            const response = await axios.get(
                `http://localhost:8081/api/user/viewUserProfile?userID=${userID}&t=${timestamp}`,
                { responseType: "blob" }
            );

            if (response.data && response.data.size > 0) {
                const imageUrl = URL.createObjectURL(response.data);
                setProfileImage(imageUrl);
            }
        } catch (err) {
            console.error("Exception while fetching profile image:", err);
        }
    };

    const getActiveCategories = () => {
        const categories = [];
        if (userCategories.categoryOne) categories.push(userCategories.categoryOne);
        if (userCategories.categoryTwo) categories.push(userCategories.categoryTwo);
        if (userCategories.categoryThree) categories.push(userCategories.categoryThree);
        if (userCategories.categoryFour) categories.push(userCategories.categoryFour);
        if (userCategories.categoryFive) categories.push(userCategories.categoryFive);
        return categories;
    };

    const fullName = `${userDetails.userFirstName || ""} ${userDetails.userLastName || ""}`.trim();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-600">Loading profile data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Profile</h2>
                    <p className="text-gray-700">{error}</p>
                    <div className="mt-6">
                        <button
                            onClick={() => router.back()}
                            className="bg-[#88C34E] text-white px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#7ab041] hover:shadow-md inline-block"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 p-6 mt-[70px] font-['Poppins']">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-lg">
                <div className="bg-[#88C34E] p-6 relative">
                    <div className="flex items-center">
                        <div className="rounded-full overflow-hidden border-4 border-white mr-4 w-20 h-20 relative">
                            {profileImage ? (
                                <Image
                                    src={profileImage}
                                    alt="Profile"
                                    layout="fill"
                                    objectFit="cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-12 w-12 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{fullName || "User"}</h1>
                            <p className="text-white text-opacity-90">{userDetails.mobile || "No phone number"}</p>
                        </div>
                    </div>
                    <div className="absolute top-6 right-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center bg-black text-white px-4 py-2 rounded-full transition-all duration-300 hover:bg-gray-800 hover:shadow-lg"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Products
                        </button>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-4 font-['Poppins']">About me</h2>
                        <div className="bg-gray-100 rounded-xl p-4 mb-6 max-h-64 overflow-y-auto">
                            <p className="text-gray-600">{userCategories.aboutMe || "No information provided yet."}</p>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 font-['Poppins']">Product Categories</h2>
                        {getActiveCategories().length > 0 ? (
                            <ul className="list-disc pl-6">
                                {getActiveCategories().map((category, index) => (
                                    <li key={index} className="text-gray-600 mb-2">{category}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No product categories available.</p>
                        )}
                    </div>
                    <div className="bg-gray-200 rounded-xl p-6">
                        <h2 className="text-3xl font-bold mb-6 font-['Poppins']">Personal Details:</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <span className="w-8 text-gray-500">📧</span>
                                <span className="w-28 text-gray-500">Email:</span>
                                <span className="font-medium">{userDetails.email || "Not provided"}</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-8 text-gray-500">📍</span>
                                <span className="w-28 text-gray-500">Address:</span>
                                <span className="font-medium">{userDetails.address || "Not provided"}</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-8 text-gray-500">🏙️</span>
                                <span className="w-28 text-gray-500">City:</span>
                                <span className="font-medium">{userDetails.city || "Not provided"}</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-8 text-gray-500">🌐</span>
                                <span className="w-28 text-gray-500">Country:</span>
                                <span className="font-medium">{userDetails.country || "Not provided"}</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-8 text-gray-500">📮</span>
                                <span className="w-28 text-gray-500">Postal Code:</span>
                                <span className="font-medium">{userDetails.postalCode || "Not provided"}</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-8 text-gray-500">📱</span>
                                <span className="w-28 text-gray-500">Mobile:</span>
                                <span className="font-medium">{userDetails.mobile || "Not provided"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerProfilePage;