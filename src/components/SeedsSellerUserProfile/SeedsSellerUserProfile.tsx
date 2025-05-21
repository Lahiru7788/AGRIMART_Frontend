"use client";

import { useEffect, useState, useRef } from "react";
import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { getWithExpiry } from "../../../auth-utils";
import { StaticImageData } from "next/image";
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles

interface UserDetailsState {
    userFirstName: string;
    userLastName: string;
    mobile: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    email: string;
}

interface UserCategoriesState {
    aboutMe: string;
    categoryOne: string;
    categoryTwo: string;
    categoryThree: string;
    categoryFour: string;
    categoryFive: string;
}

const ProfilePage = () => {
    const [userDetails, setUserDetails] = useState<UserDetailsState>({
        userFirstName: "",
        userLastName: "",
        mobile: "",
        address: "",
        city: "",
        country: "",
        postalCode: "",
        email: "",
    });

    const [userCategories, setUserCategories] = useState<UserCategoriesState>({
        aboutMe: "",
        categoryOne: "",
        categoryTwo: "",
        categoryThree: "",
        categoryFour: "",
        categoryFive: "",
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | StaticImageData | null>(null);
    const [showImageModal, setShowImageModal] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userID = getWithExpiry("userID");
                if (!userID) {
                    throw new Error("User ID not found in session. Please log in again.");
                }

                // Fetch user details
                const detailsResponse = await fetch(`http://localhost:8081/api/user/viewUserDetails/${userID}`);
                if (!detailsResponse.ok) {
                    throw new Error(`Failed to fetch user details: ${detailsResponse.status}`);
                }
                const detailsData = await detailsResponse.json();

                if (
                    detailsData.status === "200" &&
                    detailsData.userDetailsGetResponse &&
                    detailsData.userDetailsGetResponse.length > 0
                ) {
                    const userDetailsData = detailsData.userDetailsGetResponse[0];
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
                const categoriesResponse = await fetch(`http://localhost:8081/api/user/viewUserCategories/${userID}`);
                if (categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();
                    if (categoriesData.status === "200" && categoriesData.userCategoriesGetResponse) {
                        const categoryData = categoriesData.userCategoriesGetResponse[0] || {};
                        setUserCategories({
                            aboutMe: categoryData.aboutMe || "",
                            categoryOne: categoryData.categoryOne || "",
                            categoryTwo: categoryData.categoryTwo || "",
                            categoryThree: categoryData.categoryThree || "",
                            categoryFour: categoryData.categoryFour || "",
                            categoryFive: categoryData.categoryFive || "",
                        });
                    }
                }

                // Fetch user profile image
                await fetchProfileImage(userID);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const fetchProfileImage = async (userID: string): Promise<void> => {
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(
                `http://localhost:8081/api/user/viewUserProfile?userID=${userID}&t=${timestamp}`
            );
            if (response.ok) {
                const blob = await response.blob();
                if (blob.size > 0) {
                    const imageUrl = URL.createObjectURL(blob);
                    setProfileImage(imageUrl);
                }
            }
        } catch (err) {
            console.error("Exception while fetching profile image:", err);
        }
    };

    const handleImageClick = (): void => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            const imageUrl = URL.createObjectURL(file);
            setImagePreviewUrl(imageUrl);
            setShowImageModal(true);
        }
    };

    const uploadImage = async (): Promise<void> => {
        if (!selectedImage) {
            toast.error("Please select an image first", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        try {
            const userID = getWithExpiry("userID");
            if (!userID) {
                throw new Error("User ID not found in session.");
            }

            const formData = new FormData();
            formData.append("profilePicture", selectedImage);
            formData.append("userID", userID);

            const response = await axios.post("http://localhost:8081/api/user/userProfile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            toast.success("Profile image uploaded successfully!", {
                position: "top-right",
                autoClose: 5000,
            });

            setProfileImage(imagePreviewUrl);
            setShowImageModal(false);
            setSelectedImage(null);
            setImagePreviewUrl(null);

            // Refresh profile image from server
            setTimeout(() => fetchProfileImage(userID), 1000);
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Error uploading profile image. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const getActiveCategories = (): string[] => {
        const categories: string[] = [];
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
                        <Link
                            href="/login-page"
                            className="bg-[#88C34E] text-white px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#7ab041] hover:shadow-md inline-block"
                        >
                            Return to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const fontStyles = `
    @font-face {
        font-family: 'Poppins';
        src: url('/fonts/Poppins-Regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
    }
    @font-face {
        font-family: 'Poppins';
        src: url('/fonts/Poppins-Bold.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
    }
    body {
        font-family: 'Poppins', sans-serif;
    }
  `;

    return (
        <div className="bg-gray-100 p-6 mt-[70px] font-['Poppins']">
            <style jsx global>{fontStyles}</style>
            <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-lg">
                <div className="bg-[#88C34E] p-6 relative">
                    <div className="flex items-center">
                        <div
                            className="rounded-full overflow-hidden border-4 border-white mr-4 w-20 h-20 cursor-pointer relative transition-all duration-300 hover:shadow-lg hover:border-opacity-80 hover:scale-105"
                            onClick={handleImageClick}
                            title="Click to change profile picture"
                        >
                            {profileImage ? (
                                <div className="w-full h-full relative">
                                    <Image src={profileImage} alt="Profile" layout="fill" objectFit="cover" />
                                </div>
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
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{fullName || "User"}</h1>
                            <p className="text-white text-opacity-90">{userDetails.mobile || "No phone number"}</p>
                        </div>
                    </div>
                    <div className="absolute top-6 right-6">
                        <Link
                            href="/seedsSellerProfileSettings"
                            className="flex items-center bg-black text-white px-4 py-2 rounded-full transition-all duration-300 hover:bg-gray-800 hover:shadow-lg"
                        >
                            <Settings size={18} className="mr-2" />
                            Profile Settings
                        </Link>
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
            {showImageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-xl font-bold mb-4 font-['Poppins']">Confirm Profile Image</h3>
                        <div className="flex justify-center mb-6">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#88C34E]">
                                {imagePreviewUrl && (
                                    <div className="w-full h-full relative">
                                        <Image src={imagePreviewUrl} alt="Profile Preview" layout="fill" objectFit="cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6 text-center">Do you want to use this image as your profile picture?</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => {
                                    setShowImageModal(false);
                                    setSelectedImage(null);
                                    setImagePreviewUrl(null);
                                }}
                                className="px-4 py-2 bg-gray-300 rounded-lg transition-all duration-300 hover:bg-gray-400 hover:shadow-md font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={uploadImage}
                                className="px-4 py-2 bg-[#88C34E] text-white rounded-lg transition-all duration-300 hover:bg-[#7ab041] hover:shadow-md font-medium"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;