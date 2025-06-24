"use client"
import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard } from 'lucide-react';
import { getWithExpiry } from '../../../../auth-utils';

interface BillingDetails {
    firstName: string;
    lastName: string;
    country: string;
    date: string;
    mobileNumber: string;
    postcode: string;
    address: string;
}

interface CreditCardDetails {
    cardNumber: string;
    name: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
}

interface OrderItem {
    orderID: string;
    type: 'farmer' | 'seed' | 'fertilizer';
}

const PaymentInterface = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userID, setUserID] = useState<string>('');
    const [orderIDs, setOrderIDs] = useState<OrderItem[]>([]);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const [billingDetails, setBillingDetails] = useState<BillingDetails>({
        firstName: '',
        lastName: '',
        country: '',
        date: '',
        mobileNumber: '',
        postcode: '',
        address: ''
    });

    const [creditCardDetails, setCreditCardDetails] = useState<CreditCardDetails>({
        cardNumber: '',
        name: '',
        cvc: '',
        expiryMonth: '',
        expiryYear: ''
    });

    useEffect(() => {
        const user = getWithExpiry('userID');
        if (user) { // Fixed: Check if user exists, not userID
            setUserID(user.userID);
            fetchBillingDetails(user.userID);
        }

        // Get order IDs from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const ordersParam = urlParams.get('orders');
        if (ordersParam) {
            try {
                const orders = JSON.parse(decodeURIComponent(ordersParam));
                setOrderIDs(orders);
            } catch (e) {
                console.error('Error parsing orders:', e);
            }
        }
    }, []);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchBillingDetails = async (userID: number) => { // Fixed: Changed Integer to number
        try {
            const response = await fetch(`http://localhost:8081/api/user/viewUserDetails/${userID}`);
            if (response.ok) {
                const userData = await response.json();
                console.log('API Response:', userData); // Debug log

                // Fixed: Access the correct response structure
                if (userData.userDetailsGetResponse && userData.userDetailsGetResponse.length > 0) {
                    const userDetails = userData.userDetailsGetResponse[0];

                    // Map API response fields to billing details state
                    setBillingDetails({
                        firstName: userDetails.userFirstName || userDetails.user?.firstName || '',
                        lastName: userDetails.userLastName || userDetails.user?.lastName || '',
                        country: userDetails.country || '',
                        date: '', // This field doesn't exist in API response, keep empty
                        mobileNumber: userDetails.mobile || '',
                        postcode: userDetails.postalCode || '',
                        address: userDetails.address || ''
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching billing details:', error);
            showToast('Failed to load existing billing details', 'error');
        }
    };

    const handleBillingChange = (field: keyof BillingDetails, value: string) => {
        setBillingDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCreditCardChange = (field: keyof CreditCardDetails, value: string) => {
        if (field === 'cardNumber') {
            // Format card number with spaces
            value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
            if (value.length > 19) return;
        }

        if (field === 'cvc' && value.length > 3) return;

        if ((field === 'expiryMonth' || field === 'expiryYear') && value.length > 2) return;

        setCreditCardDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveBillingDetails = async () => {
        if (!validateBillingDetails()) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8081/api/user/userBillingDetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userID,
                    ...billingDetails
                }),
            });

            if (response.ok) {
                showToast('Billing details saved successfully!', 'success');
                setCurrentStep(2);
            } else {
                showToast('Failed to save billing details. Please try again.', 'error');
            }
        } catch (error) {
            showToast('Network error. Please check your connection.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const validateBillingDetails = () => {
        const required = ['firstName', 'lastName', 'country', 'mobileNumber', 'address'];
        for (const field of required) {
            if (!billingDetails[field as keyof BillingDetails].trim()) {
                showToast(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
                return false;
            }
        }
        return true;
    };

    const validateCreditCard = () => {
        if (!creditCardDetails.cardNumber.replace(/\s/g, '') || creditCardDetails.cardNumber.replace(/\s/g, '').length < 16) {
            showToast('Please enter a valid card number', 'error');
            return false;
        }
        if (!creditCardDetails.name.trim()) {
            showToast('Please enter cardholder name', 'error');
            return false;
        }
        if (!creditCardDetails.cvc || creditCardDetails.cvc.length < 3) {
            showToast('Please enter a valid CVC', 'error');
            return false;
        }
        if (!creditCardDetails.expiryMonth || !creditCardDetails.expiryYear) {
            showToast('Please enter expiry date', 'error');
            return false;
        }
        return true;
    };

    const processPayment = async () => {
        if (!validateCreditCard()) return;

        setLoading(true);
        try {
            const paymentPromises = orderIDs.map(async (order) => {
                let endpoint = '';
                if (order.type === 'farmer') {
                    endpoint = `http://localhost:8081/api/user/consumer-payment/${order.orderID}/confirm`;
                } else if (order.type === 'seed' || order.type === 'fertilizer') {
                    endpoint = `http://localhost:8081/api/user/consumerSeeds-payment/${order.orderID}/confirm`;
                }

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userID,
                        ...creditCardDetails,
                        orderID: order.orderID
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Payment failed for order ${order.orderID}`);
                }
                return response.json();
            });

            await Promise.all(paymentPromises);
            showToast('Payment successful! All orders confirmed.', 'success');

            // Redirect to success page or dashboard
            setTimeout(() => {
                window.location.href = '/dashboard/orders';
            }, 2000);

        } catch (error) {
            showToast('Payment failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
                    toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                    {toast.message}
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4">
                        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-[#5C8F2B]' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                currentStep >= 1 ? 'bg-[#5C8F2B] text-white' : 'bg-gray-200'
                            }`}>
                                1
                            </div>
                            <span className="font-medium">Billing Details</span>
                        </div>
                        <div className="w-16 h-0.5 bg-gray-300"></div>
                        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-[#5C8F2B]' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                currentStep >= 2 ? 'bg-[#5C8F2B] text-white' : 'bg-gray-200'
                            }`}>
                                2
                            </div>
                            <span className="font-medium">Payment Details</span>
                        </div>
                    </div>
                </div>

                {/* Billing Details Form */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-[30px] shadow-lg p-8">
                        <div className="bg-[#7FB542] text-white text-center py-4 rounded-[20px] mb-8">
                            <h2 className="text-2xl font-semibold">Billing Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={billingDetails.firstName}
                                    onChange={(e) => handleBillingChange('firstName', e.target.value)}
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={billingDetails.lastName}
                                    onChange={(e) => handleBillingChange('lastName', e.target.value)}
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={billingDetails.country}
                                    onChange={(e) => handleBillingChange('country', e.target.value)}
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="date"
                                    placeholder="Date"
                                    value={billingDetails.date}
                                    onChange={(e) => handleBillingChange('date', e.target.value)}
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                />
                                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={billingDetails.mobileNumber}
                                    onChange={(e) => handleBillingChange('mobileNumber', e.target.value)}
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Postcode/ZIP"
                                    value={billingDetails.postcode}
                                    onChange={(e) => handleBillingChange('postcode', e.target.value)}
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
              <textarea
                  placeholder="Address"
                  value={billingDetails.address}
                  onChange={(e) => handleBillingChange('address', e.target.value)}
                  rows={4}
                  className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full resize-none"
              />
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={saveBillingDetails}
                                disabled={loading}
                                className="w-full bg-[#7FB542] text-white py-4 rounded-[20px] font-semibold text-lg hover:bg-[#6fa038] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Continue'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Credit Card Details Form */}
                {currentStep === 2 && (
                    <div className="bg-white rounded-[30px] shadow-lg p-8">
                        <div className="bg-[#7FB542] text-white text-center py-4 rounded-[20px] mb-8">
                            <h2 className="text-2xl font-semibold">Credit Card Details</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                                <p className="text-xs text-gray-500 mb-3">Enter the 16-digit card number on the card</p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="1234 1234 1234 1234"
                                        value={creditCardDetails.cardNumber}
                                        onChange={(e) => handleCreditCardChange('cardNumber', e.target.value)}
                                        className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full pr-32"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMiAyMCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMCIgcj0iOCIgZmlsbD0iI0VCMDAxQiIvPjxjaXJjbGUgY3g9IjIxIiBjeT0iMTAiIHI9IjgiIGZpbGw9IiNGRkE1MDAiLz48cGF0aCBkPSJNMTQgNmMtMS40IDEuNC0yIDMuNi0yIDMuNnMuNiAyLjIgMiAzLjZjMS40LTEuNCAyLTMuNiAyLTMuNlMxNS40IDYuNCA1IDZ6IiBmaWxsPSIjRkY1RjAwIi8+PC9zdmc+" alt="Mastercard" className="w-8 h-5" />
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMiAyMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzAwNTFBNSIvPjx0ZXh0IHg9IjE2IiB5PSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WSVNBPC90ZXh0Pjwvc3ZnPg==" alt="Visa" className="w-8 h-5" />
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMiAyMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzAwNjZBNSIvPjx0ZXh0IHg9IjE2IiB5PSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjciIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BTUVEPC90ZXh0Pjwvc3ZnPg==" alt="Amex" className="w-8 h-5" />
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMiAyMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iI0ZGNTEyOSIvPjx0ZXh0IHg9IjE2IiB5PSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjciIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ESVNDPC90ZXh0Pjwvc3ZnPg==" alt="Discover" className="w-8 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <p className="text-xs text-gray-500 mb-3">Enter name of your card</p>
                                <input
                                    type="text"
                                    placeholder="Enter cardholder name"
                                    value={creditCardDetails.name}
                                    onChange={(e) => handleCreditCardChange('name', e.target.value)}
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">CVC Number</label>
                                <p className="text-xs text-gray-500 mb-3">Enter the 3-digit number on the card</p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="123"
                                        value={creditCardDetails.cvc}
                                        onChange={(e) => handleCreditCardChange('cvc', e.target.value)}
                                        className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full pr-12"
                                    />
                                    <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                                <p className="text-xs text-gray-500 mb-3">Enter the expiration date of the card</p>
                                <div className="flex space-x-4">
                                    <input
                                        type="text"
                                        placeholder="MM"
                                        value={creditCardDetails.expiryMonth}
                                        onChange={(e) => handleCreditCardChange('expiryMonth', e.target.value)}
                                        className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none flex-1"
                                    />
                                    <span className="flex items-center text-gray-400 text-xl font-bold">/</span>
                                    <input
                                        type="text"
                                        placeholder="YY"
                                        value={creditCardDetails.expiryYear}
                                        onChange={(e) => handleCreditCardChange('expiryYear', e.target.value)}
                                        className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex space-x-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-[20px] font-semibold text-lg hover:bg-gray-300 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={processPayment}
                                disabled={loading}
                                className="flex-1 bg-[#7FB542] text-white py-4 rounded-[20px] font-semibold text-lg hover:bg-[#6fa038] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Order Summary */}
                {orderIDs.length > 0 && (
                    <div className="mt-6 bg-white rounded-[20px] shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                        <div className="space-y-2">
                            {orderIDs.map((order, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <span className="text-gray-600">Order #{order.orderID}</span>
                                    <span className="text-sm text-gray-500 capitalize">{order.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentInterface;