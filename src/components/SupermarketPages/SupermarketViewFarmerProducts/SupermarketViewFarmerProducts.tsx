"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination } from "@mui/material";
import Image from "next/image";
import { toast } from "react-toastify";
import {useRouter} from "next/navigation";

const CategoryDropdown = ({ categories, onCategoryChange }) => {
    return (
        <div className="relative mt-[-10px] ml-[8px] ">
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

const ViewOrderHistoryButton = () => {
    const router = useRouter(); // Add this line

    const handleViewOrderHistory = () => {
        router.push('/supermarketOrderHistory');
    };

    return (
        <div className="w-full flex justify-center my-6">
            <button
                onClick={handleViewOrderHistory}
                className="bg-[#88C34E] hover:bg-[#7AB33D] text-white font-poppins-bold px-8 py-3 rounded-full shadow-md transition-colors duration-200 flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                View Order History
            </button>
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

const ProductCard = ({ product, onViewDetails }) => {
    const [offerDetails, setOfferDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [showOfferPopup, setShowOfferPopup] = useState(false);
    const router = useRouter(); // Add router import

    useEffect(() => {
        // Fetch offer details if available
        if (product.hasOffer) {
            fetchOfferDetails();
        }

        // Fetch farmer profile image if userID is available
        if (product.user && product.user.userID) {
            fetchFarmerProfileImage(product.user.userID);
        }
    }, [product.productID]);

    const fetchOfferDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewFarmerOffersByProductId/${product.productID}`
            );

            // Access the correct part of the response structure
            if (response.data.farmerOfferGetResponse &&
                response.data.farmerOfferGetResponse.length > 0) {
                setOfferDetails(response.data.farmerOfferGetResponse[0]);
            }
        } catch (error) {
            console.error("Error fetching offer details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFarmerProfileImage = async (userID) => {
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewUserProfile?userID=${userID}`,
                { responseType: "blob" }
            );
            setProfileImage(URL.createObjectURL(response.data));
        } catch (error) {
            console.error(`Error fetching profile image for user ${userID}:`, error);
            // Profile image not available, will use default icon
        }
    };

    // Different shadow styling based on whether product has an offer
    const cardShadowClass = product.hasOffer
        ? "bg-white shadow-md shadow-[#88C34E] border rounded-[20px] p-4 w-80 relative"
        : "bg-white shadow-md rounded-[20px] p-4 w-80 relative";

    const toggleOfferPopup = () => {
        setShowOfferPopup(!showOfferPopup);
    };

    // Handle click on profile image to navigate to farmer profile
    const handleProfileClick = () => {
        if (product.user && product.user.userID) {
            // Use query parameter instead of path parameter
            router.push(`/supermarketViewFarmerProfile?userID=${product.user.userID}`);
        }
    };

    const OnViewDetails = () => {
        if (product.user && product.user.userID) {
            // Use query parameter instead of path parameter
            router.push(`/supermarketViewProductDetailsPage?productID=${product.productID}`);
        }
    };

    return (
        <div className={`${cardShadowClass} w-[320px] ml-[8px] mt-[-30px] p-3`}>
            {/* Farmer profile image */}
            <div className="absolute top-2 right-2 flex flex-col items-center">
                <div
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#88C34E] flex items-center justify-center bg-gray-200 cursor-pointer hover:opacity-80"
                    onClick={handleProfileClick}
                >
                    {profileImage ? (
                        <Image
                            src={profileImage}
                            alt="Farmer"
                            width={40}
                            height={40}
                            className="object-cover"
                        />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    )}
                </div>

                {/* Offer label below profile image */}
                {product.hasOffer && (
                    <div
                        className="mt-1 bg-[#88C34E] font-poppins-regular text-white px-2 py-1 rounded-lg text-sm cursor-pointer"
                        onClick={toggleOfferPopup}
                    >
                        Offer
                    </div>
                )}
            </div>

            {/* Offer details popup */}
            {showOfferPopup && offerDetails && (
                <div className="absolute right-0 mt-16 mr-2 bg-white shadow-lg rounded-lg p-3 z-10 w-64 border border-[#88C34E]">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-poppins-bold text-gray-700">Offer Details</h4>
                        <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={toggleOfferPopup}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-[#88C34E] mb-4">
                        <div className="flex justify-between mb-2">
                            <span className="font-poppins-regular text-gray-600">Original Price:</span>
                            <span className="font-poppins-bold line-through text-gray-500">Rs. {product.price}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="font-poppins-regular text-gray-600">New Price:</span>
                            <span className="font-poppins-bold text-[#88C34E]">Rs. {offerDetails.newPrice}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="font-poppins-regular text-gray-600">Discount:</span>
                            <span className="font-poppins-bold text-red-500">
                                                {((product.price - offerDetails.newPrice) / product.price * 100).toFixed(0)}%
                                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-poppins-regular text-gray-600">Description:</span>
                            <span className="font-poppins-bold text-gray-700">
                                                {offerDetails.offerDescription}
                                            </span>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-gray-600 font-poppins-bold">
                Product #{product.productID}
            </h2>
            <p className="text-gray-400 font-poppins-regular text-sm">
                {product.addedDate}
            </p>
            <h3 className="text-lg font-poppins-bold text-center">
                {product.productName}
            </h3>
            {/* Image frame with fixed dimensions */}
            <div className="w-full h-24 flex items-center justify-center bg-white border border-gray-300 rounded-lg overflow-hidden my-2">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.productName}
                        width={96}
                        height={96}
                        className="object-contain max-h-24"
                    />
                ) : (
                    <p>No image available</p>
                )}
            </div>

            {/* Available Quantity - Left/Right Layout */}
            <div className="flex justify-between items-center my-2">
                <p className="text-gray-600 font-poppins-bold">Available Quantity:</p>
                <p className="text-[#88C34E] font-poppins-bold">{product.availableQuantity}Kg</p>
            </div>

            {/* Price - Left/Right Layout */}
            <div className="flex justify-between items-center my-2">
                <p className="text-gray-600 font-poppins-bold">1KG Price:</p>
                {product.hasOffer ? (
                    <div className="text-right">
                        {isLoading ? (
                            <p className="text-gray-500">Loading...</p>
                        ) : offerDetails ? (
                            <div className="flex items-center">
                                <span className="line-through mr-2 text-[#88C34E] font-poppins-bold">Rs. {product.price}</span>
                                <span className="text-red-600 font-poppins-bold">Rs. {offerDetails.newPrice}</span>
                            </div>
                        ) : (
                            <p className=" text-[#88C34E] font-poppins-bold">Rs. {product.price}</p>
                        )}
                    </div>
                ) : (
                    <p className="text-[#88C34E] font-poppins-bold">Rs. {product.price}</p>
                )}
            </div>

            {/* Description - Left/Right Layout */}
            <div className="mt-2">
                <p className="text-gray-600 font-poppins-bold mb-1">Description:</p>
                <div className="bg-gray-100 rounded-lg p-2 h-[71px] overflow-y-auto">
                    <p className="text-gray-700 font-poppins-regular">
                        {product.description}
                    </p>
                </div>
            </div>

            {/* View Details Button */}
            <div className="flex justify-center mt-4 pt-2 border-t border-gray-300">
                <button
                    className="w-full bg-[#88C34E] hover:bg-[#7AB33D] text-white font-poppins-bold py-2 rounded-lg transition-colors"
                    onClick={OnViewDetails}
                >
                    View Product Details
                </button>
            </div>
        </div>
    );
};


// const ProductDetailsPage = ({ product, offerDetails, onBack }) => {
//     const [quantity, setQuantity] = useState(500); // Default 500g
//     const [customQuantity, setCustomQuantity] = useState(0); // For custom input in grams
//     const [selectedPreset, setSelectedPreset] = useState("500g"); // Default selected preset
//     const [totalPrice, setTotalPrice] = useState(0);
//
//     // Presets in grams
//     const presets = [
//         { label: "100g", value: 100 },
//         { label: "500g", value: 500 },
//         { label: "1kg", value: 1000 },
//         { label: "2kg", value: 2000 },
//     ];
//
//     useEffect(() => {
//         // Calculate initial price based on default quantity
//         calculatePrice(500);
//     }, [product, offerDetails]);
//
//     const calculatePrice = (grams) => {
//         const kilograms = grams / 1000;
//         const basePrice = product.price;
//         const pricePerKg = offerDetails ? offerDetails.newPrice : basePrice;
//         const calculatedPrice = pricePerKg * kilograms;
//         setTotalPrice(calculatedPrice);
//         return calculatedPrice;
//     };
//
//     const handlePresetChange = (presetGrams, presetLabel) => {
//         setSelectedPreset(presetLabel);
//         setQuantity(presetGrams);
//         calculatePrice(presetGrams);
//         setCustomQuantity(0); // Reset custom quantity when preset is selected
//     };
//
//     const handleCustomQuantityChange = (e) => {
//         const value = parseInt(e.target.value) || 0;
//         setCustomQuantity(value);
//         setQuantity(value);
//         calculatePrice(value);
//         setSelectedPreset(""); // Clear preset selection when using custom quantity
//     };
//
//     const increaseQuantity = () => {
//         const newQuantity = customQuantity + 1;
//         setCustomQuantity(newQuantity);
//         setQuantity(newQuantity);
//         calculatePrice(newQuantity);
//         setSelectedPreset(""); // Clear preset selection
//     };
//
//     const decreaseQuantity = () => {
//         if (customQuantity > 0) {
//             const newQuantity = customQuantity - 1;
//             setCustomQuantity(newQuantity);
//             setQuantity(newQuantity);
//             calculatePrice(newQuantity);
//             setSelectedPreset(""); // Clear preset selection
//         }
//     };
//
//     const handleAddToCart = () => {
//         toast.success(`Added ${quantity}g of ${product.productName} to cart!`, {
//             position: "top-right",
//             autoClose: 3000,
//         });
//     };
//
//     const handleOrderNow = () => {
//         toast.info(`Proceeding to checkout with ${quantity}g of ${product.productName}`, {
//             position: "top-right",
//             autoClose: 3000,
//         });
//     };
//
//     return (
//         <div className="container mx-auto p-4 mt-[80px] w-[1060px]">
//
//
//             <div className="bg-white shadow-lg rounded-xl p-4">
//
//                 <div className="flex flex-col md:flex-row">
//                     {/* Left Side - Product Image and Description */}
//                     <div className="md:w-1/2 pr-4">
//                         <div className="mb-2 flex">
//                             <button
//                                 onClick={onBack}
//                                 className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-poppins-bold py-2 px-4 rounded-lg flex items-center"
//                             >
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                                 </svg>
//                                 Back to Products
//                             </button>
//                             <div className="ml-[55px]">
//                                 <h2 className="text-gray-600 font-poppins-bold">
//                                     Product #{product.productID}
//                                 </h2>
//                                 <p className="text-gray-400 font-poppins-regular text-sm">
//                                     {product.addedDate}
//                                 </p>
//                             </div>
//                         </div>
//
//                         <div className="flex items-center justify-center bg-white border border-gray-200 rounded-lg mb-4">
//                             {product.imageUrl ? (
//                                 <Image
//                                     src={product.imageUrl}
//                                     alt={product.productName}
//                                     width={300}
//                                     height={300}
//                                     className="object-contain max-h-64"
//                                 />
//                             ) : (
//                                 <div className="flex flex-col items-center justify-center h-64 w-full bg-gray-100 rounded-lg">
//                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                     </svg>
//                                     <p className="mt-2 text-gray-500">No image available</p>
//                                 </div>
//                             )}
//                         </div>
//
//                         {/* Description */}
//                         <div className="mb-4">
//                             <h3 className="text-lg font-poppins-bold text-gray-700 mb-2">Description</h3>
//                             <div className="bg-gray-100 rounded-lg p-3">
//                                 <p className="text-gray-700 font-poppins-regular">
//                                     {product.description}
//                                 </p>
//                             </div>
//                         </div>
//
//                         {/* Buttons */}
//                         <div className="flex gap-4 mb-4">
//                             <button
//                                 className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-poppins-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
//                                 onClick={handleAddToCart}
//                             >
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                                 </svg>
//                                 Add to Cart
//                             </button>
//                             <button
//                                 className="w-1/2 bg-[#88C34E] hover:bg-[#7AB33D] text-white font-poppins-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
//                                 onClick={handleOrderNow}
//                             >
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                 </svg>
//                                 Order Now
//                             </button>
//                         </div>
//                     </div>
//
//                     {/* Right Side - Product Details */}
//                     <div className="md:w-1/2 pl-[115px] pt-[20px]">
//                         <h1 className="text-3xl font-poppins-bold text-gray-800 mb-4">
//                             {product.productName}
//                         </h1>
//
//                         {offerDetails ? (
//                             <div className="mb-4">
//                                 <span className="text-2xl text-[#88C34E] font-poppins-bold">Rs. {offerDetails.newPrice} for 1Kg</span>
//                             </div>
//                         ) : (
//                             <div className="mb-4">
//                                 <span className="text-2xl text-[#88C34E] font-poppins-bold">Rs. {product.price} for 1Kg</span>
//                             </div>
//                         )}
//                         <div className="mb-4">
//                             <h3 className="text-lg font-poppins-bold text-gray-700 mt-[30px] mb-2">Select Quantity</h3>
//                             <div className="flex flex-wrap gap-3">
//                                 {presets.map((preset) => (
//                                     <button
//                                         key={preset.label}
//                                         className={`px-4 py-2 rounded-full ${
//                                             selectedPreset === preset.label
//                                                 ? 'bg-[#88C34E] text-white'
//                                                 : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
//                                         } font-poppins-regular transition-colors`}
//                                         onClick={() => handlePresetChange(preset.value, preset.label)}
//                                     >
//                                         {preset.label}
//                                     </button>
//                                 ))}
//                                 <button
//                                     className={`px-4 py-2 rounded-full ${
//                                         selectedPreset === "Clear"
//                                             ? 'bg-red-500 text-white'
//                                             : 'bg-red-100 text-red-800 hover:bg-red-200'
//                                     } font-poppins-regular transition-colors`}
//                                     onClick={() => {
//                                         setSelectedPreset("Clear");
//                                         setQuantity(0);
//                                         setCustomQuantity(0);
//                                         setTotalPrice(0);
//                                     }}
//                                 >
//                                     Clear
//                                 </button>
//                             </div>
//                         </div>
//
//                         <div className="mb-4">
//                             <h3 className="text-lg font-poppins-bold text-gray-700 mb-2 mt-[30px]">Add Quantity (grams)</h3>
//                             <div className="flex items-center">
//                                 <button
//                                     className="bg-[#88C34E] text-white w-10 h-10 rounded-l-lg flex items-center justify-center text-xl"
//                                     onClick={decreaseQuantity}
//                                 >
//                                     -
//                                 </button>
//                                 <input
//                                     type="number"
//                                     value={customQuantity}
//                                     onChange={handleCustomQuantityChange}
//                                     className="w-24 h-10 text-center border-t border-b border-gray-300 font-poppins-regular"
//                                     min="0"
//                                 />
//                                 <button
//                                     className="bg-[#88C34E] text-white w-10 h-10 rounded-r-lg flex items-center justify-center text-xl"
//                                     onClick={increaseQuantity}
//                                 >
//                                     +
//                                 </button>
//                             </div>
//                         </div>
//
//                         <div className="mb-4">
//                             <h3 className="text-lg font-poppins-bold text-gray-700">Available Quantity</h3>
//                             <p className="text-[#88C34E] font-poppins-bold text-xl">{product.availableQuantity}Kg</p>
//                         </div>
//
//                         <div className="mb-4">
//                             <h3 className="text-lg mt-[30px] font-poppins-bold text-gray-700">Price</h3>
//                             <div className="flex items-center">
//                                 <span className="text-3xl font-poppins-bold text-[#88C34E]">
//                                     Rs {totalPrice.toFixed(2)}
//                                 </span>
//                                 <span className="ml-2 text-sm text-gray-500">
//                                     for {quantity}g
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 3;
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productOfferDetails, setProductOfferDetails] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState(["Vegetables", "Fruits", "Cereals"]);
    const [viewingProductDetails, setViewingProductDetails] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        // Apply both search and category filters
        filterProducts();
    }, [products, selectedCategory]);

    const filterProducts = (searchTerm = "") => {
        let filtered = [...products];

        // Filter by search term if provided
        if (searchTerm.trim()) {
            filtered = filtered.filter((product) =>
                product.productName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category if selected
        if (selectedCategory) {
            filtered = filtered.filter(
                (product) => product.productCategory === selectedCategory
            );
        }

        setFilteredProducts(filtered);
        // Reset to first page when filtering
        setPage(1);
    };

    const handleSearch = (searchTerm) => {
        filterProducts(searchTerm);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const fetchProducts = async () => {
        try {
            // Use the updated API endpoint without userID
            const response = await axios.get(
                `http://localhost:8081/api/user/viewFarmerProducts`
            );

            const productList = response.data.farmerProductGetResponse || [];

            // Filter out deleted products
            const activeProducts = productList.filter(product => product.deleted !== true);

            // Fetch images and check offers for each product
            const productsWithImages = await Promise.all(
                activeProducts.map(async (product) => {
                    let updatedProduct = { ...product, imageUrl: null, hasOffer: false };

                    // Check if product has offers
                    try {
                        const offerResponse = await axios.get(
                            `http://localhost:8081/api/user/viewFarmerOffersByProductId/${product.productID}`
                        );

                        // If offers array exists and has items, product has an offer
                        updatedProduct.hasOffer =
                            offerResponse.data.farmerOfferGetResponse &&
                            offerResponse.data.farmerOfferGetResponse.length > 0;
                    } catch (error) {
                        console.error(`Error checking offers for product ${product.productID}:`, error);
                    }

                    // Fetch product image if product ID exists
                    if (product.productID) {
                        try {
                            const imageResponse = await axios.get(
                                `http://localhost:8081/api/user/viewFarmerProductImage?productID=${product.productID}`,
                                { responseType: "blob" }
                            );
                            updatedProduct.imageUrl = URL.createObjectURL(imageResponse.data);
                        } catch (error) {
                            console.error(`Error fetching image for product ${product.productID}:`, error);
                        }
                    }

                    return updatedProduct;
                })
            );

            setProducts(productsWithImages);
            setFilteredProducts(productsWithImages);

            // Extract unique categories from products
            const uniqueCategories = [...new Set(productsWithImages.map(product => product.productCategory))].filter(Boolean);
            if (uniqueCategories.length > 0) {
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to load products. Please try again later.", {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const handleChange = (event, value) => {
        setPage(value);
    };

    const handleViewDetails = async (product) => {
        setSelectedProduct(product);

        // Fetch offer details if available
        if (product.hasOffer) {
            try {
                const response = await axios.get(
                    `http://localhost:8081/api/user/viewFarmerOffersByProductId/${product.productID}`
                );

                if (response.data.farmerOfferGetResponse &&
                    response.data.farmerOfferGetResponse.length > 0) {
                    setProductOfferDetails(response.data.farmerOfferGetResponse[0]);
                }
            } catch (error) {
                console.error("Error fetching offer details:", error);
                toast.error("Failed to load offer details. Please try again.", {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } else {
            setProductOfferDetails(null);
        }

        setViewingProductDetails(true);
    };

    const handleBackToProducts = () => {
        setViewingProductDetails(false);
        setSelectedProduct(null);
        setProductOfferDetails(null);
    };

    const paginatedProducts = filteredProducts.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    if (viewingProductDetails && selectedProduct) {
        return (
            <ProductDetailsPage
                product={selectedProduct}
                offerDetails={productOfferDetails}
                onBack={handleBackToProducts}
            />
        );
    }

    return (
        <div className="pt-[100px] p-6 bg-gray-100 min-h-screen relative">
            {/* Filters row */}
            <div className="flex justify-between items-center mb-6">
                <CategoryDropdown
                    onCategoryChange={handleCategoryChange}
                    categories={categories}
                />
                <ViewOrderHistoryButton />
                <SearchBar onSearch={handleSearch} />
            </div>

            <div className="flex flex-wrap gap-6 mt-12">
                {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                        <ProductCard
                            key={product.productID}
                            product={product}
                            onViewDetails={handleViewDetails}
                        />
                    ))
                ) : (
                    <div className="w-full text-center py-8">
                        <p className="text-gray-500 font-poppins-regular text-lg">No products found matching your criteria.</p>
                    </div>
                )}
            </div>

            <div className="flex justify-center mt-[20px]">
                <Pagination
                    count={Math.ceil(filteredProducts.length / itemsPerPage)}
                    page={page}
                    onChange={handleChange}
                    color="primary"
                />
            </div>
        </div>
    );
};

export default ProductList;