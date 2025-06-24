"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination } from "@mui/material";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { getWithExpiry } from "../../../../auth-utils";
import {router} from "next/client";
import ProductDetailsPage from "../SupermarketViewSFProductDetailsPage/SupermarketViewSFProductDetailsPage";


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
        router.push('/supermarketSFOrderHistory');
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
                `http://localhost:8081/api/user/viewsAndFProductOffersByProductId/${product.productID}`
            );

            // Access the correct part of the response structure
            if (response.data.sfOfferGetResponse &&
                response.data.sfOfferGetResponse.length > 0) {
                setOfferDetails(response.data.sfOfferGetResponse[0]);
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
            router.push(`/consumerViewSFProfile?userID=${product.user.userID}`);
        }
    };

    const OnViewDetails = () => {
        if (product.user && product.user.userID) {
            // Use query parameter instead of path parameter
            router.push(`/consumerViewSFProductDetailsPage?productID=${product.productID}`);
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

    // Get userID from URL query parameters
    const searchParams = useSearchParams();
    const userID = searchParams.get('userID');

    useEffect(() => {
        if (userID) {
            fetchProducts();
        } else {
            toast.error("User ID not found. Please navigate from the previous page.", {
                position: "top-right",
                autoClose: 5000,
            });
        }
    }, [userID]);

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
            // Use the updated API endpoint with userID
            const response = await axios.get(
                `http://localhost:8081/api/user/viewSeedsAndFertilizerProduct/${userID}`
            );

            const productList = response.data.seedsAndFertilizerProductGetResponse || [];

            // Filter out deleted products
            const activeProducts = productList.filter(product => product.deleted !== true);

            // Fetch images and check offers for each product
            const productsWithImages = await Promise.all(
                activeProducts.map(async (product) => {
                    let updatedProduct = { ...product, imageUrl: null, hasOffer: false };

                    // Check if product has offers
                    try {
                        const offerResponse = await axios.get(
                            `http://localhost:8081/api/user/viewsAndFProductOffersByProductId/${product.productID}`
                        );

                        // If offers array exists and has items, product has an offer
                        updatedProduct.hasOffer =
                            offerResponse.data.sfOfferGetResponse &&
                            offerResponse.data.sfOfferGetResponse.length > 0;
                    } catch (error) {
                        console.error(`Error checking offers for product ${product.productID}:`, error);
                    }

                    // Fetch product image if product ID exists
                    if (product.productID) {
                        try {
                            const imageResponse = await axios.get(
                                `http://localhost:8081/api/user/viewSAndFProductImage?productID=${product.productID}`,
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
                    `http://localhost:8081/api/user/viewsAndFProductOffersByProductId/${product.productID}`
                );

                if (response.data.sfOfferGetResponse &&
                    response.data.sfOfferGetResponse.length > 0) {
                    setProductOfferDetails(response.data.sfOfferGetResponse[0]);
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

    // Show loading or error message if userID is not available
    if (!userID) {
        return (
            <div className="pt-[100px] p-6 bg-gray-100 min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <p className="text-gray-500 font-poppins-regular text-lg mb-4">
                        User ID not found. Please navigate from the previous page.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-[#88C34E] hover:bg-[#7AB33D] text-white font-poppins-bold px-6 py-2 rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
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