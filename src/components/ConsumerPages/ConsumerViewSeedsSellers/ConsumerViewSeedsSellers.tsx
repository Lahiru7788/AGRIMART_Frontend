"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination } from "@mui/material";
import Image from "next/image";
import { toast } from "react-toastify";
import { getWithExpiry } from "../../../../auth-utils";
import { useRouter } from "next/navigation";

// const CategoryDropdown = ({ categories, onCategoryChange }) => {
//     return (
//         <div className="relative mt-[-10px] ml-[8px] ">
//             <select
//                 onChange={(e) => onCategoryChange(e.target.value)}
//                 className="px-4 py-2  w-[280px] bg-white font-poppins-regular border-none shadow-md rounded-full focus:ring-2 focus:ring-[#88C34E] outline-none appearance-none"
//             >
//                 <option value="">All Categories</option>
//                 {categories.map((category, index) => (
//                     <option key={index} value={category}>
//                         {category}
//                     </option>
//                 ))}
//             </select>
//             <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
//                 </svg>
//             </div>
//         </div>
//     );
// };

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
                    placeholder="Search farmers"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-14 pr-4 py-2 w-[280px] bg-white font-poppins-regular border-none shadow-md rounded-full focus:ring-2 focus:ring-[#88C34E] outline-none"
                />
            </div>
        </div>
    );
};

const FarmerCard = ({ farmer }) => {
    const [profileImage, setProfileImage] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchProfileImage();
    }, [farmer.user.userID]);

    const fetchProfileImage = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewUserProfile?userID=${farmer.user.userID}`,
                { responseType: "blob" }
            );
            const imageUrl = URL.createObjectURL(response.data);
            setProfileImage(imageUrl);
        } catch (error) {
            console.error("Error fetching profile image:", error);
        }
    };

    const handleProfileClick = () => {
        router.push(`/consumerViewSFProfile?userID=${farmer.user.userID}`);
    };

    const handleViewProducts = () => {
        router.push(`/consumerViewSellerProductDetails?userID=${farmer.user.userID}`);
    };

    return (
        <div className="bg-white shadow-md rounded-[20px] p-4 w-80 relative w-[320px] ml-[8px] mt-[10px] p-3 pt-16">
            {/* Profile Image positioned to extend outside the card */}
            <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 z-10">
                <div
                    className="w-24 h-24 rounded-full border-4 border-[#88C34E] overflow-hidden cursor-pointer hover:border-[#7AB33D] transition-colors bg-white"
                    onClick={handleProfileClick}
                >
                    {profileImage ? (
                        <Image
                            src={profileImage}
                            alt={`${farmer.userFirstName} ${farmer.userLastName}`}
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
                Seed and Fertilizer Seller ID #{farmer.user.userID}
            </h2>

            <h3 className="text-lg font-poppins-bold text-center">
                {farmer.userFirstName} {farmer.userLastName}
            </h3>

            {/* Email - Left/Right Layout */}
            <div className="flex justify-between items-center my-2">
                <p className="text-gray-600 font-poppins-bold">Email:</p>
                <p className="text-[#88C34E] font-poppins-regular text-sm truncate max-w-[150px]">
                    {farmer.user.userEmail}
                </p>
            </div>

            {/* Mobile - Left/Right Layout */}
            <div className="flex justify-between items-center my-2">
                <p className="text-gray-600 font-poppins-bold">Mobile:</p>
                <p className="text-[#88C34E] font-poppins-regular">{farmer.mobile}</p>
            </div>

            {/* Address - Left/Right Layout */}
            <div className="mt-2">
                <p className="text-gray-600 font-poppins-bold mb-1">Address:</p>
                <div className="bg-gray-100 rounded-lg p-2 h-[60px] overflow-y-auto">
                    <p className="text-gray-700 font-poppins-regular text-sm">
                        {farmer.address}
                    </p>
                </div>
            </div>

            {/* City and Country - Left/Right Layout */}
            <div className="flex justify-between items-center my-2">
                <p className="text-gray-600 font-poppins-bold">City:</p>
                <p className="text-gray-700 font-poppins-regular">{farmer.city}</p>
            </div>

            <div className="flex justify-between items-center my-2">
                <p className="text-gray-600 font-poppins-bold">Country:</p>
                <p className="text-gray-700 font-poppins-regular">{farmer.country}</p>
            </div>

            {/* Action Button */}
            <div className="flex justify-center mt-4 pt-2 border-t border-gray-300">
                <button
                    className="w-full py-2 px-4 bg-[#88C34E] hover:bg-[#7AB33D] text-white rounded-lg font-poppins-bold text-sm transition-colors"
                    onClick={handleViewProducts}
                >
                    View Products
                </button>
            </div>
        </div>
    );
};

const FarmerList = () => {
    const [farmers, setFarmers] = useState([]);
    const [filteredFarmers, setFilteredFarmers] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 3;

    useEffect(() => {
        fetchFarmers();
    }, []);

    useEffect(() => {
        // Apply both search and category filters
        filterFarmers();
    }, [farmers]);

    const filterFarmers = (searchTerm = "") => {
        let filtered = [...farmers];

        // Filter by search term if provided
        if (searchTerm.trim()) {
            filtered = filtered.filter((farmer) =>
                `${farmer.userFirstName} ${farmer.userLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                farmer.user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                farmer.city.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category if selected (you can add category field to farmer data if needed)

        setFilteredFarmers(filtered);
        // Reset to first page when filtering
        setPage(1);
    };

    const handleSearch = (searchTerm) => {
        filterFarmers(searchTerm);
    };



    const fetchFarmers = async () => {
        try {
            const response = await axios.get(
                'http://localhost:8081/api/user/viewAllUserDetails'
            );

            const userDetailsList = response.data.userDetailsGetResponse || [];

            // Filter to get only farmers
            const farmersList = userDetailsList.filter(userDetail =>
                userDetail.user && userDetail.user.userType === "SeedsAndFertilizerSeller"
            );

            setFarmers(farmersList);
            setFilteredFarmers(farmersList);

        } catch (error) {
            console.error("Error fetching farmers:", error);
            toast.error('Failed to fetch farmers data.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const handleChange = (event, value) => {
        setPage(value);
    };

    const paginatedFarmers = filteredFarmers.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="pt-[100px] p-6 bg-gray-100 min-h-screen relative">
            {/* Filters row */}
            <div className="flex justify-between items-center mb-6">
                {/*<CategoryDropdown*/}
                {/*    onCategoryChange={handleCategoryChange}*/}
                {/*    categories={categories}*/}
                {/*/>*/}
                <SearchBar onSearch={handleSearch} />
            </div>

            <div className="flex flex-wrap gap-6 mt-12">
                {paginatedFarmers.length > 0 ? (
                    paginatedFarmers.map((farmer) => (
                        <FarmerCard
                            key={farmer.user.userID}
                            farmer={farmer}
                        />
                    ))
                ) : (
                    <div className="w-full text-center py-8">
                        <p className="text-gray-500 font-poppins-regular text-lg">No farmers found matching your criteria.</p>
                    </div>
                )}
            </div>
            <div className="flex justify-center mt-[20px]">
                <Pagination
                    count={Math.ceil(filteredFarmers.length / itemsPerPage)}
                    page={page}
                    onChange={handleChange}
                    color="primary"
                />
            </div>
        </div>
    );
};

export default FarmerList;