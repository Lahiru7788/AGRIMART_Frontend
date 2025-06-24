"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, CreditCard, Building2, DollarSign } from 'lucide-react';
import { getWithExpiry } from '../../../../auth-utils';

// Types
interface User {
    userID: number;
    userEmail: string;
    firstName: string;
    lastName: string;
    userType: string;
}

interface FarmerProduct {
    productID: number;
    productName: string;
    price: number;
    availableQuantity: number;
    minimumQuantity: number;
    description: string;
    addedDate: string;
    productCategory: string;
    user: User;
    active: boolean;
    quantityLowered: boolean;
    deleted: boolean;
}

interface SfProduct {
    productID: number;
    productName: string;
    price: number;
    availableQuantity: number;
    minimumQuantity: number;
    description: string;
    addedDate: string;
    productCategory: string;
    user: User;
    active: boolean;
    quantityLowered: boolean;
    deleted: boolean;
}

interface ConsumerOrder {
    orderID: number;
    productID: number;
    productName: string;
    price: number;
    requiredQuantity: number;
    description: string;
    addedDate: string;
    productCategory: string;
    user: User;
    farmerProduct: FarmerProduct | null;
    sfProduct: SfProduct | null;
    active: boolean;
    confirmed: boolean;
    addedToCart: boolean;
    removedFromCart: boolean;
    rejected: boolean;
    paid: boolean;
}

interface CartItem extends ConsumerOrder {
    imageUrl?: string;
    totalPrice: number;
    isFarmerProduct: boolean;
}

const ShoppingCart: React.FC = () => {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState('credit');
    const [removing, setRemoving] = useState<number | null>(null);

    // Get user ID using actual auth utils
    const userID = getWithExpiry('userID');

    // Fetch cart items on component mount
    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            setLoading(true);

            // Fetch both farmer and seeds/fertilizer orders
            const [farmerResponse, seedsResponse] = await Promise.all([
                fetch(`http://localhost:8081/api/user/viewSupermarketOrdersByConsumerID/${userID}`).then(res => res.json()),
                fetch(`http://localhost:8081/api/user/viewSupermarketSeedsOrdersByConsumerID/${userID}`).then(res => res.json())
            ]);

            // Filter cart items based on criteria
            const farmerCartItems = farmerResponse.supermarketOrderGetResponse?.filter((order: ConsumerOrder) =>
                order.active && order.addedToCart && !order.removedFromCart && order.confirmed && !order.rejected && !order.paid
            ) || [];

            const seedsCartItems = seedsResponse.supermarketSeedsOrderGetResponse?.filter((order: ConsumerOrder) =>
                order.active && order.addedToCart && !order.removedFromCart && order.confirmed && !order.rejected && !order.paid
            ) || [];

            // Process and combine items
            const processedFarmerItems = await Promise.all(
                farmerCartItems.map(async (item: ConsumerOrder) => {
                    const productID = item.farmerProduct?.productID;
                    let imageUrl = '';

                    if (productID) {
                        try {
                            const imageResponse = await fetch(`http://localhost:8081/api/user/viewFarmerProductImage?productID=${productID}`);
                            if (imageResponse.ok) {
                                const blob = await imageResponse.blob();
                                imageUrl = URL.createObjectURL(blob);
                            }
                        } catch (error) {
                            console.error('Error fetching farmer product image:', error);
                        }
                    }

                    return {
                        ...item,
                        imageUrl,
                        totalPrice: item.price * item.requiredQuantity,
                        isFarmerProduct: true
                    };
                })
            );

            const processedSeedsItems = await Promise.all(
                seedsCartItems.map(async (item: ConsumerOrder) => {
                    const productID = item.sfProduct?.productID;
                    let imageUrl = '';

                    if (productID) {
                        try {
                            const imageResponse = await fetch(`http://localhost:8081/api/user/seedsAndFertilizerProductImage?productID=${productID}`);
                            if (imageResponse.ok) {
                                const blob = await imageResponse.blob();
                                imageUrl = URL.createObjectURL(blob);
                            }
                        } catch (error) {
                            console.error('Error fetching seeds product image:', error);
                        }
                    }

                    return {
                        ...item,
                        imageUrl,
                        totalPrice: item.price * item.requiredQuantity,
                        isFarmerProduct: false
                    };
                })
            );

            setCartItems([...processedFarmerItems, ...processedSeedsItems]);
        } catch (error) {
            console.error('Error fetching cart items:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (orderID: number, isFarmerProduct: boolean) => {
        try {
            setRemoving(orderID);

            const apiUrl = isFarmerProduct
                ? `http://localhost:8081/api/user/Supermarket-removedFromCart/${orderID}/confirm`
                : `http://localhost:8081/api/user/SupermarketSeeds-removedFromCart/${orderID}/confirm`;

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Remove item from local state
                setCartItems(prev => prev.filter(item => item.orderID !== orderID));
            } else {
                console.error('Failed to remove item from cart');
            }
        } catch (error) {
            console.error('Error removing item from cart:', error);
        } finally {
            setRemoving(null);
        }
    };

    const calculateSubTotal = () => {
        return cartItems.reduce((total, item) => total + item.totalPrice, 0);
    };

    const handleCheckout = () => {
        router.push('/supermarketAddBillingDetails');
    };

    const handleContinueShopping = () => {
        router.push('/supermarketViewProducts');
    };

    // Show loading state while fetching data
    if (loading) {
        return (
            <div className="flex-1 bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm p-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-100 p-6 mt-[60px] ml-[10px] ">
            <div className=" ">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden w-[1025px]">
                    {/* Fixed Header */}
                    <div className="sticky top-0 z-10 bg-[#88C34E] px-8 py-6">
                        <h1 className="text-white text-3xl font-bold text-center" style={{ fontFamily: 'Poppins' }}>
                            Shopping Cart
                        </h1>
                    </div>

                    <div className="flex flex-col lg:flex-row">
                        {/* Cart Items - Scrollable */}
                        <div className="flex-1 p-6">
                            {cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 text-lg mb-4" style={{ fontFamily: 'Poppins' }}>
                                        Your cart is empty
                                    </div>
                                    <button
                                        onClick={handleContinueShopping}
                                        className="bg-green-400 text-white px-6 py-3 rounded-xl hover:bg-green-500 transition-colors"
                                        style={{ fontFamily: 'Poppins' }}
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                    {cartItems.map((item) => (
                                        <div
                                            key={item.orderID}
                                            className="bg-green-50 rounded-2xl p-6 border border-green-200 flex items-center justify-between"
                                        >
                                            <div className="flex items-center space-x-4 flex-1">
                                                {/* Product Image */}
                                                <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.productName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                            <span className="text-gray-500 text-xs">No Image</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins' }}>
                                                        {item.productName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mb-2" style={{ fontFamily: 'Poppins' }}>
                                                        Product #{item.isFarmerProduct ? item.farmerProduct?.productID : item.sfProduct?.productID}
                                                    </p>
                                                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins' }}>
                                                        {item.description}
                                                    </p>
                                                </div>

                                                {/* Quantity and Price */}
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins' }}>
                                                        {item.requiredQuantity}kg
                                                    </p>
                                                    <p className="text-xl font-bold text-green-600" style={{ fontFamily: 'Poppins' }}>
                                                        Rs {item.totalPrice.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFromCart(item.orderID, item.isFarmerProduct)}
                                                disabled={removing === item.orderID}
                                                className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {removing === item.orderID ? (
                                                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <X size={20} />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fixed Payment Sidebar */}
                        <div className="lg:w-80 bg-white p-6 border-l ">
                            <div className="sticky top-0">
                                {/* Payment Information */}
                                <div className="bg-[#88C34E] rounded-2xl p-6 mb-6">
                                    <h2 className="text-white text-xl font-bold mb-4" style={{ fontFamily: 'Poppins' }}>
                                        Payment Information
                                    </h2>

                                    <div className="space-y-4">
                                        {/* Credit/Debit Card */}
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="credit"
                                                checked={selectedPayment === 'credit'}
                                                onChange={(e) => setSelectedPayment(e.target.value)}
                                                className="w-4 h-4 text-green-600"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <CreditCard size={20} className="text-white" />
                                                <span className="text-white font-medium" style={{ fontFamily: 'Poppins' }}>
                          Credit/Debit Card
                        </span>
                                            </div>
                                        </label>

                                        {/* Direct Bank Payment */}
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="bank"
                                                checked={selectedPayment === 'bank'}
                                                onChange={(e) => setSelectedPayment(e.target.value)}
                                                className="w-4 h-4 text-green-600"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <Building2 size={20} className="text-white" />
                                                <span className="text-white font-medium" style={{ fontFamily: 'Poppins' }}>
                          Direct Bank Payment
                        </span>
                                            </div>
                                        </label>

                                        {/* PayPal */}
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="paypal"
                                                checked={selectedPayment === 'paypal'}
                                                onChange={(e) => setSelectedPayment(e.target.value)}
                                                className="w-4 h-4 text-green-600"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <DollarSign size={20} className="text-white" />
                                                <span className="text-white font-medium" style={{ fontFamily: 'Poppins' }}>
                          PayPal
                        </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Total and Checkout */}
                                <div className="bg-white rounded-2xl">
                                    <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 font-medium" style={{ fontFamily: 'Poppins' }}>
                      *{cartItems.length} items
                    </span>
                                        <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins' }}>
                      Sub Total: Rs {calculateSubTotal().toFixed(2)}
                    </span>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={cartItems.length === 0}
                                        className="w-full bg-[#88C34E] text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ fontFamily: 'Poppins' }}
                                    >
                                        CHECKOUT
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingCart;