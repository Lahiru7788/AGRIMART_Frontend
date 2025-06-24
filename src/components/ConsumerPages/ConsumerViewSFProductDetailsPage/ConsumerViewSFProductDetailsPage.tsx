"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { getWithExpiry } from "../../../../auth-utils";

const ProductDetailsPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productID = searchParams.get('productID');

    const [product, setProduct] = useState(null);
    const [offerDetails, setOfferDetails] = useState(null);
    const [quantity, setQuantity] = useState(500);
    const [customQuantity, setCustomQuantity] = useState(0);
    const [selectedPreset, setSelectedPreset] = useState("500g");
    const [totalPrice, setTotalPrice] = useState(0);
    const [profileImage, setProfileImage] = useState(null);
    const [showOfferPopup, setShowOfferPopup] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [hasPendingOrder, setHasPendingOrder] = useState(false);
    const [isCheckingOrder, setIsCheckingOrder] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmedOrderIds, setConfirmedOrderIds] = useState([]);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const presets = [
        { label: "100g", value: 100 },
        { label: "500g", value: 500 },
        { label: "1kg", value: 1000 },
        { label: "2kg", value: 2000 },
    ];

    useEffect(() => {
        if (productID) {
            fetchProductDetails();
        } else {
            toast.error("Product ID not found", {
                position: "top-right",
                autoClose: 3000,
            });
            router.push('/products'); // Redirect to products page if no productID
        }
    }, [productID]);

    useEffect(() => {
        if (product) {
            calculatePrice(500);
            if (product.user && product.user.userID) {
                fetchFarmerProfileImage(product.user.userID);
            }
            checkPendingOrder();
        }
    }, [product, offerDetails]);

    const fetchProductDetails = async () => {
        try {
            setIsLoading(true);

            // Fetch all products and find the specific one
            const response = await axios.get(
                `http://localhost:8081/api/user/viewSeedsAndFertilizerProduct`
            );

            const productList = response.data.seedsAndFertilizerProductGetResponse || [];
            const foundProduct = productList.find(p => p.productID.toString() === productID);

            if (!foundProduct) {
                toast.error("Product not found", {
                    position: "top-right",
                    autoClose: 3000,
                });
                router.push('/products');
                return;
            }

            // Fetch product image
            let productWithImage = { ...foundProduct, imageUrl: null, hasOffer: false };

            try {
                const imageResponse = await axios.get(
                    `http://localhost:8081/api/user/viewSAndFProductImage?productID=${productID}`,
                    { responseType: "blob" }
                );
                productWithImage.imageUrl = URL.createObjectURL(imageResponse.data);
            } catch (error) {
                console.error(`Error fetching image for product ${productID}:`, error);
            }

            // Check for offers
            try {
                const offerResponse = await axios.get(
                    `http://localhost:8081/api/user/viewsAndFProductOffersByProductId/${productID}`
                );

                if (offerResponse.data.sfOfferGetResponse &&
                    offerResponse.data.sfOfferGetResponse.length > 0) {
                    productWithImage.hasOffer = true;
                    setOfferDetails(offerResponse.data.sfOfferGetResponse[0]);
                }
            } catch (error) {
                console.error(`Error checking offers for product ${productID}:`, error);
            }

            setProduct(productWithImage);
        } catch (error) {
            console.error("Error fetching product details:", error);
            toast.error("Failed to load product details", {
                position: "top-right",
                autoClose: 3000,
            });
            router.push('/products');
        } finally {
            setIsLoading(false);
        }
    };

    const checkPendingOrder = async () => {
        try {
            setIsCheckingOrder(true);
            const consumerUserID = getWithExpiry('userID');

            if (!consumerUserID) {
                console.log('No consumer userID found');
                setHasPendingOrder(false);
                setConfirmedOrderIds([]);
                return;
            }

            const response = await axios.get(
                `http://localhost:8081/api/user/viewConsumerSeedsOrdersByConsumerID/${consumerUserID}`,
                { withCredentials: true }
            );

            if (response.status === 200 && response.data.consumerSeedsOrderGetResponse) {
                const allOrders = response.data.consumerSeedsOrderGetResponse;

                // Debug: Log all orders
                console.log('All orders from API:', allOrders);
                console.log('Current productID:', productID);
                console.log('Current productID type:', typeof productID);

                // Debug: Log orders for this specific product
                const ordersForThisProduct = allOrders.filter(order =>
                    order.sfProduct?.productID.toString() === productID
                );
                console.log('Orders for this product:', ordersForThisProduct);

                // Debug: Log order properties for each order
                ordersForThisProduct.forEach((order, index) => {
                    console.log(`Order ${index + 1}:`, {
                        orderID: order.orderID,
                        productID: order.sfProduct?.productID,
                        active: order.active,
                        confirmed: order.confirmed,
                        rejected: order.rejected,
                        addedToCart: order.addedToCart,
                        // Log the entire order object to see all available properties
                        fullOrder: order
                    });
                });

                // Check for pending orders (not confirmed and not rejected)
                const pendingOrders = allOrders.filter(order =>
                    order.sfProduct?.productID.toString() === productID &&
                    order.active === true &&
                    order.confirmed === false &&
                    order.rejected === false
                );

                // Get confirmed orders for this product with addedToCart === false filter
                const confirmedOrders1 = allOrders.filter(order =>
                    order.sfProduct?.productID.toString() === productID &&
                    order.active === true &&
                    order.confirmed === true &&
                    order.addedToCart === false &&
                    order.removedFromCart === false &&
                    order.rejected === false
                );

                // Alternative filtering (in case confirmed is a string)
                const confirmedOrders2 = allOrders.filter(order =>
                    order.sfProduct?.productID.toString() === productID &&
                    order.active === true &&
                    (order.confirmed === true || order.confirmed === 'true' || order.confirmed === 1) &&
                    order.addedToCart === false  &&
                    order.removedFromCart === false &&
                    order.rejected === false
                );

                // Alternative filtering (in case active is different)
                const confirmedOrders3 = allOrders.filter(order =>
                    order.sfProduct?.productID.toString() === productID &&
                    (order.confirmed === true || order.confirmed === 'true' || order.confirmed === 1) &&
                    order.addedToCart === false  &&
                    order.removedFromCart === false &&
                    order.rejected === false
                );

                console.log('Pending orders:', pendingOrders);
                console.log('Confirmed orders (method 1):', confirmedOrders1);
                console.log('Confirmed orders (method 2):', confirmedOrders2);
                console.log('Confirmed orders (method 3):', confirmedOrders3);

                // Use the method that finds confirmed orders
                let confirmedOrders = confirmedOrders1;
                if (confirmedOrders1.length === 0 && confirmedOrders2.length > 0) {
                    confirmedOrders = confirmedOrders2;
                } else if (confirmedOrders1.length === 0 && confirmedOrders2.length === 0 && confirmedOrders3.length > 0) {
                    confirmedOrders = confirmedOrders3;
                }

                console.log('Final confirmed orders to use:', confirmedOrders);

                setHasPendingOrder(pendingOrders.length > 0);
                setConfirmedOrderIds(confirmedOrders.map(order => order.orderID));

                // Debug: Log final state
                console.log('Setting hasPendingOrder to:', pendingOrders.length > 0);
                console.log('Setting confirmedOrderIds to:', confirmedOrders.map(order => order.orderID));

            } else {
                console.log('No orders found in response:', response.data);
                setHasPendingOrder(false);
                setConfirmedOrderIds([]);
            }
        } catch (error) {
            console.error('Error checking pending orders:', error);
            console.error('Error details:', error.response?.data);
            setHasPendingOrder(false);
            setConfirmedOrderIds([]);
        } finally {
            setIsCheckingOrder(false);
        }
    };
// Updated handleAddToCart function
    const handleAddToCart = async () => {
        if (hasPendingOrder) {
            toast.error("Cannot add to cart while order is pending farmer confirmation", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        if (confirmedOrderIds.length === 0) {
            toast.error("No confirmed orders found to add to cart", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setIsAddingToCart(true);

        try {
            // Call the API for each confirmed order ID using PUT method
            const addToCartPromises = confirmedOrderIds.map(async (orderID) => {
                try {
                    const response = await axios.put(
                        `http://localhost:8081/api/user/consumerSeeds-addedToCart/${orderID}/confirm`,
                        {}, // Empty body for PUT request
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            withCredentials: true
                        }
                    );
                    return { orderID, success: true, response };
                } catch (error) {
                    console.error(`Error adding order ${orderID} to cart:`, error);
                    return { orderID, success: false, error };
                }
            });

            const results = await Promise.all(addToCartPromises);

            // Check results
            const successfulOrders = results.filter(result => result.success);
            const failedOrders = results.filter(result => !result.success);

            if (successfulOrders.length > 0) {
                toast.success(
                    `Successfully added ${successfulOrders.length} confirmed order(s) of ${product.productName} to cart!`,
                    {
                        position: "top-right",
                        autoClose: 4000,
                    }
                );

                // Refresh the order status after successful cart addition
                await checkPendingOrder();
            }

            if (failedOrders.length > 0) {
                toast.error(
                    `Failed to add ${failedOrders.length} order(s) to cart. Please try again.`,
                    {
                        position: "top-right",
                        autoClose: 4000,
                    }
                );
            }

        } catch (error) {
            console.error('Error in handleAddToCart:', error);
            toast.error("An unexpected error occurred while adding to cart", {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsAddingToCart(false);
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
        }
    };

    const calculatePrice = (grams) => {
        if (!product) return 0;

        const kilograms = grams / 1000;
        const basePrice = product.price;
        const pricePerKg = offerDetails ? offerDetails.newPrice : basePrice;
        const calculatedPrice = pricePerKg * kilograms;
        setTotalPrice(calculatedPrice);
        return calculatedPrice;
    };

    const handlePresetChange = (presetGrams, presetLabel) => {
        setSelectedPreset(presetLabel);
        setQuantity(presetGrams);
        calculatePrice(presetGrams);
        setCustomQuantity(0);
    };

    const handleCustomQuantityChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        setCustomQuantity(value);
        setQuantity(value);
        calculatePrice(value);
        setSelectedPreset("");
    };

    const increaseQuantity = () => {
        const newQuantity = customQuantity + 1;
        setCustomQuantity(newQuantity);
        setQuantity(newQuantity);
        calculatePrice(newQuantity);
        setSelectedPreset("");
    };

    const decreaseQuantity = () => {
        if (customQuantity > 0) {
            const newQuantity = customQuantity - 1;
            setCustomQuantity(newQuantity);
            setQuantity(newQuantity);
            calculatePrice(newQuantity);
            setSelectedPreset("");
        }
    };

    // const handleAddToCart = () => {
    //     if (hasPendingOrder) {
    //         toast.error("Cannot add to cart while order is pending farmer confirmation", {
    //             position: "top-right",
    //             autoClose: 3000,
    //         });
    //         return;
    //     }
    //
    //     toast.success(`Added ${quantity}g of ${product.productName} to cart!`, {
    //         position: "top-right",
    //         autoClose: 3000,
    //     });
    // };

    const handleOrderNow = async () => {
        if (quantity <= 0) {
            toast.error("Please select a valid quantity before ordering", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        const requiredKg = quantity / 1000;
        if (requiredKg > product.availableQuantity) {
            toast.error(`Insufficient stock. Available: ${product.availableQuantity}kg`, {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setIsOrdering(true);

        try {
            const requiredQuantityKg = quantity / 1000;
            const addedDate = new Date().toISOString();

            const orderData = {
                productID: product.productID,
                productName: product.productName.trim(),
                description: product.description,
                requiredQuantity: requiredQuantityKg,
                price: totalPrice,
                addedDate: addedDate,
                productCategory: product.productCategory
            };

            const response = await axios.post(
                'http://localhost:8081/api/user/consumerSeedsOrderProducts',
                orderData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );

            if (response.status === 200 || response.status === 201) {
                toast.success(`Order placed successfully! ${requiredQuantityKg}kg of ${product.productName}`, {
                    position: "top-right",
                    autoClose: 4000,
                });

                await checkPendingOrder();
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }

        } catch (error) {
            console.error('Error placing order:', error);

            if (error.response) {
                const errorMessage = error.response.data?.message ||
                    `Server error: ${error.response.status} - ${error.response.statusText}`;
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 4000,
                });
            } else if (error.request) {
                toast.error("Network error. Please check your connection and try again.", {
                    position: "top-right",
                    autoClose: 4000,
                });
            } else {
                toast.error("An unexpected error occurred. Please try again.", {
                    position: "top-right",
                    autoClose: 4000,
                });
            }
        } finally {
            setIsOrdering(false);
        }
    };

    const toggleOfferPopup = () => {
        setShowOfferPopup(!showOfferPopup);
    };

    const handleProfileClick = () => {
        if (product.user && product.user.userID) {
            router.push(`/consumerViewSFProfile?userID=${product.user.userID}`);
        }
    };

    const handleBackToProducts = () => {
        router.push('/consumerViewSFProducts');// Go back to previous page
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 mt-[80px] w-[1060px] flex justify-center items-center">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-[#88C34E] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600 font-poppins-regular">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto p-4 mt-[80px] w-[1060px] flex justify-center items-center">
                <div className="text-center">
                    <p className="text-gray-600 font-poppins-regular text-lg">Product not found</p>
                    <button
                        onClick={handleBackToProducts}
                        className="mt-4 bg-[#88C34E] hover:bg-[#7AB33D] text-white font-poppins-bold py-2 px-4 rounded-lg"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    const containerShadowClass = hasPendingOrder ? "shadow-red-500/50 shadow-lg" : "shadow-lg";

    return (
        <div className="container mx-auto p-4 mt-[80px] w-[1060px]">
            <div className={`bg-white rounded-xl p-4 ${containerShadowClass}`}>
                {/* Pending Order Alert */}
                {hasPendingOrder && (
                    <div className="mb-4 bg-red-50 border border-red-300 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-red-700 font-poppins-regular">
                                You have a pending order for this product. Waiting for farmer confirmation.
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row">
                    {/* Left Side - Product Image and Description */}
                    <div className="md:w-1/2 pr-4">
                        <div className="mb-2 flex">
                            <button
                                onClick={handleBackToProducts}
                                className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-poppins-bold py-2 px-4 rounded-lg flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Products
                            </button>
                            <div className="ml-[55px]">
                                <h2 className="text-gray-600 font-poppins-bold">
                                    Product #{product.productID}
                                </h2>
                                <p className="text-gray-400 font-poppins-regular text-sm">
                                    {product.addedDate}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center bg-white border border-gray-200 rounded-lg mb-4">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.productName}
                                    width={300}
                                    height={300}
                                    className="object-contain max-h-64"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 w-full bg-gray-100 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="mt-2 text-gray-500">No image available</p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <h3 className="text-lg font-poppins-bold text-gray-700 mb-2">Description</h3>
                            <div className="bg-gray-100 rounded-lg p-3">
                                <p className="text-gray-700 font-poppins-regular">
                                    {product.description}
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 mb-4">
                            <button
                                className={`w-1/2 ${
                                    hasPendingOrder
                                        ? 'bg-red-500 cursor-not-allowed text-white'
                                        : confirmedOrderIds.length === 0
                                            ? 'bg-gray-400 cursor-not-allowed text-white'
                                            : isAddingToCart
                                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                } font-poppins-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors`}
                                onClick={handleAddToCart}
                                disabled={hasPendingOrder || isCheckingOrder || confirmedOrderIds.length === 0 || isAddingToCart}
                            >
                                {isAddingToCart ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Adding to Cart...
                                    </>
                                ) : hasPendingOrder ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Pending Confirmation
                                    </>
                                ) : confirmedOrderIds.length === 0 ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        No Confirmed Orders
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Add to Cart ({confirmedOrderIds.length})
                                    </>
                                )}
                            </button>
                            <button
                                className={`w-1/2 ${isOrdering
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#88C34E] hover:bg-[#7AB33D]'
                                } text-white font-poppins-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors`}
                                onClick={handleOrderNow}
                                disabled={isOrdering}
                            >
                                {isOrdering ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Order Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Product Details */}
                    <div className="md:w-1/2 pl-[115px] pt-[20px]">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-3xl font-poppins-bold text-gray-800">
                                {product.productName}
                            </h1>

                            <div className="flex items-center">
                                {/* Offer label if product has offer */}
                                {product.hasOffer && (
                                    <div
                                        className="mr-3 bg-[#88C34E] font-poppins-regular text-white px-4 py-1 rounded-lg text-sm cursor-pointer"
                                        onClick={toggleOfferPopup}
                                    >
                                        Offer Available
                                    </div>
                                )}

                                {/* Farmer profile image */}
                                <div
                                    className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#88C34E] flex items-center justify-center bg-gray-200 cursor-pointer hover:opacity-80"
                                    onClick={handleProfileClick}
                                >
                                    {profileImage ? (
                                        <Image
                                            src={profileImage}
                                            alt="Farmer"
                                            width={56}
                                            height={56}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Offer popup */}
                        {showOfferPopup && offerDetails && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                                <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-poppins-bold text-xl text-gray-800">Special Offer</h4>
                                        <button
                                            className="text-gray-500 hover:text-gray-700"
                                            onClick={toggleOfferPopup}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                                    <button
                                        className="w-full bg-[#88C34E] hover:bg-[#7AB33D] text-white font-poppins-bold py-2 rounded-lg transition-colors"
                                        onClick={toggleOfferPopup}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {offerDetails ? (
                            <div className="mb-4">
                                <span className="text-2xl text-[#88C34E] font-poppins-bold">Rs. {offerDetails.newPrice} for 1Kg</span>
                                <span className="ml-2 line-through text-lg text-gray-500">Rs. {product.price}</span>
                                <span className="ml-2 text-red-500 font-poppins-bold">
                                    (-{((product.price - offerDetails.newPrice) / product.price * 100).toFixed(0)}%)
                                </span>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <span className="text-2xl text-[#88C34E] font-poppins-bold">Rs. {product.price} for 1Kg</span>
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="text-lg font-poppins-bold text-gray-700 mt-[30px] mb-2">Select Quantity</h3>
                            <div className="flex flex-wrap gap-3">
                                {presets.map((preset) => (
                                    <button
                                        key={preset.label}
                                        className={`px-4 py-2 rounded-full ${
                                            selectedPreset === preset.label
                                                ? 'bg-[#88C34E] text-white'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        } font-poppins-regular transition-colors`}
                                        onClick={() => handlePresetChange(preset.value, preset.label)}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                <button
                                    className={`px-4 py-2 rounded-full ${
                                        selectedPreset === "Clear"
                                            ? 'bg-red-500 text-white'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    } font-poppins-regular transition-colors`}
                                    onClick={() => {
                                        setSelectedPreset("Clear");
                                        setQuantity(0);
                                        setCustomQuantity(0);
                                        setTotalPrice(0);
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg font-poppins-bold text-gray-700 mb-2 mt-[30px]">Add Quantity (grams)</h3>
                            <div className="flex items-center">
                                <button
                                    className="bg-[#88C34E] text-white w-10 h-10 rounded-l-lg flex items-center justify-center text-xl"
                                    onClick={decreaseQuantity}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={customQuantity}
                                    onChange={handleCustomQuantityChange}
                                    className="w-24 h-10 text-center border-t border-b border-gray-300 font-poppins-regular"
                                    min="0"
                                />
                                <button
                                    className="bg-[#88C34E] text-white w-10 h-10 rounded-r-lg flex items-center justify-center text-xl"
                                    onClick={increaseQuantity}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg font-poppins-bold text-gray-700">Available Quantity</h3>
                            <p className="text-[#88C34E] font-poppins-bold text-xl">{product.availableQuantity}Kg</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg mt-[30px] font-poppins-bold text-gray-700">Price</h3>
                            <div className="flex items-center">
                                <span className="text-3xl font-poppins-bold text-[#88C34E]">
                                    Rs {totalPrice.toFixed(2)}
                                </span>
                                <span className="ml-2 text-sm text-gray-500">
                                    for {quantity}g
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;