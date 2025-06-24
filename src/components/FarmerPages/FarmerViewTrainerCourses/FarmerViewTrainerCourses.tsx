"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination } from "@mui/material";
import Image from "next/image";
import { toast } from "react-toastify";
import { getWithExpiry } from "../../../../auth-utils";
import { useRouter } from "next/navigation";

const CategoryDropdown = ({ categories, onCategoryChange }) => {
    return (
        <div className="relative mt-[-10px] pt">
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

const CourseCard = ({ course, onPurchaseSuccess }) => {
    const [showOfferDetails, setShowOfferDetails] = useState(false);
    const [offerDetails, setOfferDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const router = useRouter();

    // Handle view trainer profile click
    const handleViewTrainerProfile = () => {
        if (course.user && course.user.userID) {
            router.push(`/farmerViewTrainerProfile?userID=${course.user.userID}`);
        }
    };

    // Handle view chapters click - redirect to chapters page
    const handleViewChaptersClick = () => {
        router.push(`/farmerViewCourseChapters?courseID=${course.courseID}`);
    };

    // Handle purchase confirmation popup
    const togglePurchaseConfirm = () => {
        setShowPurchaseConfirm(!showPurchaseConfirm);
    };

    // Handle actual purchase
    const handlePurchase = async () => {
        setIsPurchasing(true);
        try {
            const purchaseData = {
                courseName: course.courseName,
                price: course.price,
                description: course.description,
                courseCategory: course.courseCategory,
                courseID: course.courseID,
                addedDate: course.addedDate
            };

            await axios.post(
                `http://localhost:8081/api/user/farmerCourseOrders`,
                purchaseData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            togglePurchaseConfirm();
            toast.success('Course purchased successfully!', {
                position: "top-right",
                autoClose: 5000,
            });

            // Redirect to payment page
            router.push('/consumerAddTrainerPayements');

            if (onPurchaseSuccess) {
                onPurchaseSuccess();
            }
        } catch (error) {
            console.error("Error purchasing course:", error);
            toast.error("Failed to purchase the course. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setIsPurchasing(false);
        }
    };

    useEffect(() => {
        // Fetch offer details if available
        if (course.hasOffer) {
            fetchOfferDetails();
        }

        // Fetch trainer profile image
        if (course.user && course.user.userID) {
            fetchTrainerProfileImage();
        }
    }, [course.courseID]);

    const fetchOfferDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewTrainerCourseOffersByProductId/${course.courseID}`
            );

            // Access the correct part of the response structure
            if (response.data.trainerCourseOfferGetResponse &&
                response.data.trainerCourseOfferGetResponse.length > 0) {
                setOfferDetails(response.data.trainerCourseOfferGetResponse[0]);
            }
        } catch (error) {
            console.error("Error fetching offer details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTrainerProfileImage = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewUserProfile?userID=${course.user.userID}`,
                { responseType: "blob" }
            );
            setProfileImageUrl(URL.createObjectURL(response.data));
        } catch (error) {
            console.error("Error fetching trainer profile image:", error);
            // Don't set any image if there's an error
        }
    };

    const toggleOfferDetails = () => {
        setShowOfferDetails(!showOfferDetails);
    };

    // Different shadow styling based on whether course has an offer
    const cardShadowClass = course.hasOffer
        ? "bg-white shadow-md shadow-[#88C34E] border rounded-[20px] p-4 relative"
        : "bg-white shadow-md rounded-[20px] p-4 relative";

    return (
        <div className={`${cardShadowClass} w-full mb-4 p-4`}>
            <div className="flex">
                {/* Course Details - Left Side */}
                <div className="flex-1 pr-8">
                    {/* Trainer Profile Picture - Top Left Corner */}
                    {course.user && course.user.userID && (
                        <div
                            className="absolute top-4 left-4 w-12 h-12 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform z-10 mb-[20px]"
                            onClick={handleViewTrainerProfile}
                            title={`View ${course.user.firstName} ${course.user.lastName}'s Profile`}
                        >
                            {profileImageUrl ? (
                                <Image
                                    src={profileImageUrl}
                                    alt={`${course.user.firstName} ${course.user.lastName}`}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <div className="w-full h-full bg-[#88C34E] rounded-full flex items-center justify-center">
                                    <span className="text-white font-poppins-bold text-lg">
                                        {course.user.firstName ? course.user.firstName.charAt(0).toUpperCase() : 'T'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Top row with offer badge, date, and course ID */}
                    <div className="flex items-center justify-between mb-2 ml-16">
                        <div className="flex items-center gap-4">
                            {/* Offer Badge */}
                            {course.hasOffer && (
                                <div
                                    className="inline-block bg-[#88C34E] font-poppins-regular text-white px-3 py-1 rounded-lg cursor-pointer text-sm hover:bg-red-500 transition-colors"
                                    onClick={toggleOfferDetails}
                                >
                                    Offer Available
                                </div>
                            )}

                            {/* Date and Course ID */}
                            <div className="flex items-center gap-4">
                                <p className="text-gray-400 font-poppins-regular text-sm">
                                    {course.addedDate}
                                </p>
                                <h2 className="text-gray-600 font-poppins-bold">
                                    Course #{course.courseID}
                                </h2>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-poppins-bold mb-3 ml-16">
                        {course.courseName}
                    </h3>

                    {/* Course Details in Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-3 ml-16">
                        <div>
                            <p className="text-gray-600 font-poppins-bold text-sm">Category:</p>
                            <p className="text-[#88C34E] font-poppins-bold">{course.courseCategory}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-poppins-bold text-sm">Price:</p>
                            {course.hasOffer ? (
                                <div className="flex items-center">
                                    {isLoading ? (
                                        <p className="text-gray-500">Loading...</p>
                                    ) : offerDetails ? (
                                        <>
                                            <span className="line-through mr-2 text-[#88C34E] font-poppins-bold">Rs. {course.price}</span>
                                            <span className="text-red-600 font-poppins-bold">Rs. {offerDetails.newPrice}</span>
                                        </>
                                    ) : (
                                        <p className="text-[#88C34E] font-poppins-bold">Rs. {course.price}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-[#88C34E] font-poppins-bold">Rs. {course.price}</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="ml-16">
                        <p className="text-gray-600 font-poppins-bold text-sm mb-1">Description:</p>
                        <div className="bg-gray-100 rounded-lg p-2 h-[120px] overflow-y-auto">
                            <p className="text-gray-700 font-poppins-regular text-sm">
                                {course.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side container for image and buttons */}
                <div className="flex flex-col items-end gap-4">
                    {/* Course Image */}
                    <div className="w-48 h-48 flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                            {course.imageUrl ? (
                                <Image
                                    src={course.imageUrl}
                                    alt={course.courseName}
                                    width={192}
                                    height={192}
                                    className="object-contain max-h-48"
                                />
                            ) : (
                                <p className="text-gray-400 text-sm">No image</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons with proper spacing */}
                    <div className="flex flex-col gap-2 w-48">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-poppins-bold transition-colors w-full"
                            onClick={handleViewChaptersClick}
                            title="View Chapters"
                        >
                            View Chapters
                        </button>
                        <button
                            className="bg-[#88C34E] hover:bg-[#7AB33D] text-white px-4 py-2 rounded-lg font-poppins-bold transition-colors w-full"
                            onClick={togglePurchaseConfirm}
                            title="Purchase Course"
                        >
                            Purchase
                        </button>
                    </div>
                </div>
            </div>

            {/* Purchase Confirmation Modal */}
            {showPurchaseConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={togglePurchaseConfirm}>
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-poppins-bold text-[#88C34E]">Confirm Purchase</h3>
                            <button
                                onClick={togglePurchaseConfirm}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                                disabled={isPurchasing}
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 font-poppins-regular">
                                Are you sure you want to purchase <span className="font-poppins-bold">{course.courseName}</span>?
                            </p>
                            <div className="bg-gray-100 rounded p-3 mt-3">
                                <div className="flex justify-between">
                                    <span className="font-poppins-regular">Course:</span>
                                    <span className="font-poppins-bold">{course.courseName}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="font-poppins-regular">Price:</span>
                                    <span className="font-poppins-bold text-[#88C34E]">
                                        Rs. {course.hasOffer && offerDetails ? offerDetails.newPrice : course.price}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                className="w-1/2 bg-gray-400 hover:bg-gray-500 text-white font-poppins-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                                onClick={togglePurchaseConfirm}
                                disabled={isPurchasing}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-1/2 bg-[#88C34E] hover:bg-[#7AB33D] text-white font-poppins-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                                onClick={handlePurchase}
                                disabled={isPurchasing}
                            >
                                {isPurchasing ? 'Purchasing...' : 'Yes, Purchase'}
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
                                <span className="line-through">Rs. {course.price}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="font-poppins-bold">Offer Price:</span>
                                <span className="font-poppins-bold text-red-600">Rs. {offerDetails.newPrice}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="font-poppins-regular">Savings:</span>
                                <span className="text-green-600 font-poppins-bold">
                                    Rs. {(course.price - offerDetails.newPrice).toFixed(2)}
                                    ({((course.price - offerDetails.newPrice) / course.price * 100).toFixed(0)}% off)
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

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        // Apply both search and category filters
        filterCourses();
    }, [courses, selectedCategory]);

    const filterCourses = (searchTerm = "") => {
        let filtered = [...courses];

        // Filter by search term if provided
        if (searchTerm.trim()) {
            filtered = filtered.filter((course) =>
                course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category if selected
        if (selectedCategory) {
            filtered = filtered.filter(
                (course) => course.courseCategory === selectedCategory
            );
        }

        setFilteredCourses(filtered);
        // Reset to first page when filtering
        setPage(1);
    };

    const handleSearch = (searchTerm) => {
        filterCourses(searchTerm);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handlePurchaseSuccess = () => {
        // Refresh the course list after successful purchase if needed
        // fetchCourses();
    };

    const fetchCourses = async () => {
        try {
            // Use the updated API endpoint
            const response = await axios.get(
                `http://localhost:8081/api/user/viewCourses`
            );

            const courseList = response.data.trainerAddCourseGetResponse || [];

            // Filter out deleted courses (deleted=false only)
            const activeCourses = courseList.filter(course => course.deleted === false);

            // Fetch images and check offers for each course
            const coursesWithImages = await Promise.all(
                activeCourses.map(async (course) => {
                    let updatedCourse = { ...course, imageUrl: null, hasOffer: false };

                    // Check if course has offers
                    try {
                        const offerResponse = await axios.get(
                            `http://localhost:8081/api/user/viewTrainerCourseOffersByProductId/${course.courseID}`
                        );

                        // If offers array exists and has items, course has an offer
                        updatedCourse.hasOffer =
                            offerResponse.data.trainerCourseOfferGetResponse &&
                            offerResponse.data.trainerCourseOfferGetResponse.length > 0;
                    } catch (error) {
                        console.error(`Error checking offers for course ${course.courseID}:`, error);
                    }

                    // Fetch course image if course ID exists
                    if (course.courseID) {
                        try {
                            const imageResponse = await axios.get(
                                `http://localhost:8081/api/user/viewTrainerCourseImage?courseID=${course.courseID}`,
                                { responseType: "blob" }
                            );
                            updatedCourse.imageUrl = URL.createObjectURL(imageResponse.data);
                        } catch (error) {
                            console.error(`Error fetching image for course ${course.courseID}:`, error);
                        }
                    }

                    return updatedCourse;
                })
            );

            setCourses(coursesWithImages);
            setFilteredCourses(coursesWithImages);

            // Extract unique categories from courses
            const uniqueCategories = [...new Set(coursesWithImages.map(course => course.courseCategory))].filter(Boolean);
            if (uniqueCategories.length > 0) {
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Failed to fetch courses. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const handleChange = (event, value) => {
        setPage(value);
    };

    const paginatedCourses = filteredCourses.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="pt-[100px] p-6 bg-gray-100 min-h-screen relative">
            {/* Fixed Filters row */}
            <div className="fixed top-[100px] left-[260px] right-0 bg-gray-100 z-40 px-6 py-4 mt-4">
                <div className="flex justify-between items-center">
                    <CategoryDropdown
                        onCategoryChange={handleCategoryChange}
                        categories={categories}
                    />
                    <SearchBar onSearch={handleSearch} />
                </div>
            </div>

            {/* Course List with top margin to account for fixed filters */}
            <div className="mt-20">
                {paginatedCourses.length > 0 ? (
                    paginatedCourses.map((course) => (
                        <CourseCard
                            key={course.courseID}
                            course={course}
                            onPurchaseSuccess={handlePurchaseSuccess}
                        />
                    ))
                ) : (
                    <div className="w-full text-center py-8">
                        <p className="text-gray-500 font-poppins-regular text-lg">No courses found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-[20px]">
                <Pagination
                    count={Math.ceil(filteredCourses.length / itemsPerPage)}
                    page={page}
                    onChange={handleChange}
                    color="primary"
                />
            </div>
        </div>
    );
};

export default CourseList;