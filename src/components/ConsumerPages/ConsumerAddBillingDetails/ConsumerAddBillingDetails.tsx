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
    type: 'Farmer' | 'SeedsAndFertilizerSeller';
    price?: number;
    quantity?: number;
}

interface OrderDetailPayload {
    orderNumber: string;
    addedDate: string;
    userType: 'Farmer' | 'SeedsAndFertilizerSeller';
    price: number;
    quantity: number;
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
        console.log('Retrieved user data:', user);

        if (user) {
            let extractedUserID = null;

            if (typeof user === 'string' || typeof user === 'number') {
                extractedUserID = user.toString();
            } else if (user.userID) {
                extractedUserID = user.userID.toString();
            } else if (user.id) {
                extractedUserID = user.id.toString();
            }

            console.log('Extracted userID:', extractedUserID);

            if (extractedUserID) {
                setUserID(extractedUserID);
                fetchBillingDetails(extractedUserID);

                // Get order IDs from URL params after setting userID
                const urlParams = new URLSearchParams(window.location.search);
                const orderIDsParam = urlParams.get('orderIDs');

                if (orderIDsParam) {
                    const orderIDsArray = orderIDsParam.split(',').filter(id => id.trim() !== '');
                    console.log('Parsed orderIDs from URL:', orderIDsArray);
                    fetchOrderTypesFromUserType(orderIDsArray, extractedUserID);
                } else {
                    const ordersParam = urlParams.get('orders');
                    if (ordersParam) {
                        try {
                            const orders = JSON.parse(decodeURIComponent(ordersParam));
                            setOrderIDs(orders);
                            console.log('Set orderIDs from old format:', orders);
                        } catch (e) {
                            console.error('Error parsing orders:', e);
                            showToast('Invalid order data. Please try again.', 'error');
                        }
                    } else {
                        console.warn('No order parameters found in URL');
                        showToast('No orders found. Please add items to your cart.', 'error');
                    }
                }
            } else {
                console.error('Could not extract userID from user object:', user);
                showToast('User session not found. Please log in again.', 'error');
            }
        } else {
            console.error('No user data found in storage');
            showToast('User session not found. Please log in again.', 'error');
        }
    }, []);

    // Enhanced API request function with better error handling and CORS support
    const makeAPIRequest = async (url: string, options: RequestInit = {}) => {
        try {
            console.log(`🌐 Making API request to: ${url}`);
            console.log('Request options:', options);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                mode: 'cors', // Enable CORS
                credentials: 'include', // Include credentials if needed
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    // Add any additional headers your backend requires
                    'Access-Control-Allow-Origin': '*',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            console.log(`📡 Response status for ${url}:`, response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                console.error(`HTTP Error ${response.status}:`, errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
            }

            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
                console.warn('Non-JSON response received:', data);
            }

            console.log(`✅ Response data from ${url}:`, data);
            return { success: true, data };

        } catch (error: any) {
            console.error(`❌ API request failed for ${url}:`, error);

            let errorMessage = 'Network request failed';
            let isNetworkError = false;

            if (error.name === 'AbortError') {
                errorMessage = 'Request timeout - please try again';
                isNetworkError = true;
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Unable to connect to server. Please check if the backend is running.';
                isNetworkError = true;
            } else if (error.message) {
                errorMessage = error.message;
            }

            return {
                success: false,
                error: errorMessage,
                isNetworkError
            };
        }
    };

    const fetchOrderDetails = async (order: OrderItem): Promise<{price: number, quantity: number} | null> => {
        try {
            console.log(`🔍 Fetching order details for ${order.orderID} (${order.type})`);

            let endpoint = '';
            if (order.type === 'Farmer') {
                endpoint = `http://localhost:8081/api/user/consumer-orders/${order.orderID}`;
            } else if (order.type === 'SeedsAndFertilizerSeller') {
                endpoint = `http://localhost:8081/api/user/consumerSeeds-orders/${order.orderID}`;
            }

            if (!endpoint) {
                console.error(`No endpoint for order type: ${order.type}`);
                return null;
            }

            const result = await makeAPIRequest(endpoint);

            if (!result.success) {
                console.error(`Failed to fetch details for order ${order.orderID}:`, result.error);
                return null;
            }

            let price = 0;
            let quantity = 0;

            if (order.type === 'Farmer') {
                const orderData = result.data?.consumerOrderGetResponse?.[0];
                if (orderData) {
                    price = parseFloat(orderData.totalPrice || orderData.price || '0');
                    quantity = parseInt(orderData.quantity || '1');
                }
            } else if (order.type === 'SeedsAndFertilizerSeller') {
                const orderData = result.data?.consumerSeedsOrderGetResponse?.[0];
                if (orderData) {
                    price = parseFloat(orderData.totalPrice || orderData.price || '0');
                    quantity = parseInt(orderData.quantity || '1');
                }
            }

            console.log(`💰 Order ${order.orderID} details: price=${price}, quantity=${quantity}`);
            return { price, quantity };

        } catch (error) {
            console.error(`Error fetching order details for ${order.orderID}:`, error);
            return null;
        }
    };

    const saveOrderDetails = async (ordersWithDetails: OrderItem[]) => {
        try {
            console.log('💾 Saving order details to userOrderDetails API...');

            const currentDateTime = new Date().toISOString(); // Format: 2025-06-24T10:30:00.000Z

            const orderDetailsPayloads: OrderDetailPayload[] = ordersWithDetails.map(order => ({
                orderNumber: order.orderID,
                addedDate: currentDateTime,
                userType: order.type,
                price: order.price || 0,
                quantity: order.quantity || 1
            }));

            console.log('📦 Order details payloads:', orderDetailsPayloads);

            // Save each order detail
            const saveResults = await Promise.all(
                orderDetailsPayloads.map(async (payload) => {
                    const result = await makeAPIRequest('http://localhost:8081/api/user/userOrderDetails', {
                        method: 'POST',
                        body: JSON.stringify(payload)
                    });

                    if (!result.success) {
                        throw new Error(`Failed to save order details for ${payload.orderNumber}: ${result.error}`);
                    }

                    return result;
                })
            );

            console.log('✅ All order details saved successfully:', saveResults);
            return true;

        } catch (error: any) {
            console.error('❌ Error saving order details:', error);
            showToast(`Failed to save order details: ${error.message}`, 'error');
            return false;
        }
    };

    const fetchOrderTypesFromUserType = async (orderIDsArray: string[], currentUserID: string) => {
        if (!orderIDsArray || orderIDsArray.length === 0) return;

        try {
            console.log('🚀 Starting enhanced order type detection for orderIDs:', orderIDsArray);

            const orderResults = await Promise.all(
                orderIDsArray.map(async (orderID) => {
                    const trimmedOrderID = orderID.trim();
                    console.log(`🔍 Processing order: ${trimmedOrderID}`);

                    // Strategy 1: Try specific order endpoints
                    const orderType = await detectOrderTypeByEndpoints(trimmedOrderID);
                    if (orderType) {
                        return { orderID: trimmedOrderID, type: orderType };
                    }

                    // Strategy 2: Search in user's complete order history
                    const userOrderType = await detectOrderTypeFromUserHistory(trimmedOrderID, currentUserID);
                    if (userOrderType) {
                        return { orderID: trimmedOrderID, type: userOrderType };
                    }

                    // Strategy 3: Pattern-based detection (if your system uses patterns)
                    const patternType = detectOrderTypeByPattern(trimmedOrderID);
                    if (patternType) {
                        console.log(`🎯 Detected order type by pattern for ${trimmedOrderID}: ${patternType}`);
                        return { orderID: trimmedOrderID, type: patternType };
                    }

                    // Final fallback - but with better logic
                    console.warn(`⚠️ Could not determine type for order ${trimmedOrderID}, using intelligent fallback`);

                    // Instead of always defaulting to Farmer, try to make a more educated guess
                    const fallbackType = await intelligentFallback(trimmedOrderID, currentUserID);
                    return { orderID: trimmedOrderID, type: fallbackType };
                })
            );

            const validOrders = orderResults.filter(order => order !== null) as OrderItem[];
            console.log('✅ Final valid orders with types:', validOrders);
            setOrderIDs(validOrders);

            if (validOrders.length > 0) {
                const farmerCount = validOrders.filter(o => o.type === 'Farmer').length;
                const seedsCount = validOrders.filter(o => o.type === 'SeedsAndFertilizerSeller').length;
                showToast(`Successfully loaded ${validOrders.length} orders (${farmerCount} farmer, ${seedsCount} seeds/fertilizer).`, 'success');
            } else {
                showToast(`Could not process any orders. Please try again.`, 'error');
            }

        } catch (error) {
            console.error('💥 Error in fetchOrderTypesFromUserType:', error);
            showToast('Error loading order details. Please check your connection and try again.', 'error');
        }
    };

    const detectOrderTypeByEndpoints = async (orderID: string): Promise<'Farmer' | 'SeedsAndFertilizerSeller' | null> => {
        console.log(`🔍 Detecting order type by endpoints for: ${orderID}`);

        // Try farmer endpoint first
        const farmerResult = await makeAPIRequest(`http://localhost:8081/api/user/consumer-orders/${orderID}`);
        if (farmerResult.success && farmerResult.data?.consumerOrderGetResponse?.[0]?.farmerProduct) {
            console.log(`🌾 Confirmed ${orderID} as Farmer order via endpoint`);
            return 'Farmer';
        }

        // Try seeds/fertilizer endpoint
        const seedsResult = await makeAPIRequest(`http://localhost:8081/api/user/consumerSeeds-orders/${orderID}`);
        if (seedsResult.success && seedsResult.data?.consumerSeedsOrderGetResponse?.[0]?.sfProduct) {
            console.log(`🌱 Confirmed ${orderID} as SeedsAndFertilizerSeller order via endpoint`);
            return 'SeedsAndFertilizerSeller';
        }

        console.log(`❌ Could not detect order type via endpoints for ${orderID}`);
        return null;
    };

    const detectOrderTypeFromUserHistory = async (orderID: string, userID: string): Promise<'Farmer' | 'SeedsAndFertilizerSeller' | null> => {
        console.log(`📋 Searching user history for order: ${orderID}`);

        // Search in farmer orders
        const farmerOrdersResult = await makeAPIRequest(`http://localhost:8081/api/user/viewConsumerOrdersByConsumerID/${userID}`);
        if (farmerOrdersResult.success) {
            const farmerOrders = farmerOrdersResult.data?.consumerOrderGetResponse || [];
            const foundFarmerOrder = farmerOrders.find((order: any) =>
                order.orderID?.toString() === orderID
            );
            if (foundFarmerOrder && foundFarmerOrder.farmerProduct) {
                console.log(`🎯 Found ${orderID} in farmer orders history`);
                return 'Farmer';
            }
        }

        // Search in seeds orders
        const seedsOrdersResult = await makeAPIRequest(`http://localhost:8081/api/user/viewConsumerSeedsOrdersByConsumerID/${userID}`);
        if (seedsOrdersResult.success) {
            const seedsOrders = seedsOrdersResult.data?.consumerSeedsOrderGetResponse || [];
            const foundSeedsOrder = seedsOrders.find((order: any) =>
                order.orderID?.toString() === orderID
            );
            if (foundSeedsOrder && foundSeedsOrder.sfProduct) {
                console.log(`🎯 Found ${orderID} in seeds orders history`);
                return 'SeedsAndFertilizerSeller';
            }
        }

        return null;
    };

    const detectOrderTypeByPattern = (orderID: string): 'Farmer' | 'SeedsAndFertilizerSeller' | null => {
        // Implement pattern-based detection if your system uses specific patterns
        // For example:
        // - Farmer orders might start with 'F' or have certain number patterns
        // - Seeds orders might start with 'S' or 'SF' or have different patterns

        // Example pattern detection (customize based on your system):
        if (orderID.toLowerCase().startsWith('f') || orderID.toLowerCase().includes('farm')) {
            return 'Farmer';
        }
        if (orderID.toLowerCase().startsWith('s') || orderID.toLowerCase().includes('seed') || orderID.toLowerCase().includes('fert')) {
            return 'SeedsAndFertilizerSeller';
        }

        // You can add more sophisticated pattern matching here
        return null;
    };

    const intelligentFallback = async (orderID: string, userID: string): Promise<'Farmer' | 'SeedsAndFertilizerSeller'> => {
        console.log(`🤔 Using intelligent fallback for order: ${orderID}`);

        // Strategy: Try to determine which type of orders the user has more of
        try {
            const [farmerResult, seedsResult] = await Promise.all([
                makeAPIRequest(`http://localhost:8081/api/user/viewConsumerOrdersByConsumerID/${userID}`),
                makeAPIRequest(`http://localhost:8081/api/user/viewConsumerSeedsOrdersByConsumerID/${userID}`)
            ]);

            const farmerOrdersCount = farmerResult.success ? (farmerResult.data?.consumerOrderGetResponse?.length || 0) : 0;
            const seedsOrdersCount = seedsResult.success ? (seedsResult.data?.consumerSeedsOrderGetResponse?.length || 0) : 0;

            console.log(`📊 User order history: ${farmerOrdersCount} farmer orders, ${seedsOrdersCount} seeds orders`);

            // If user has more seeds orders, default to seeds type
            if (seedsOrdersCount > farmerOrdersCount) {
                console.log(`🌱 Defaulting to SeedsAndFertilizerSeller based on user history`);
                return 'SeedsAndFertilizerSeller';
            }
        } catch (error) {
            console.error('Error in intelligent fallback:', error);
        }

        // Final fallback to Farmer
        console.log(`🌾 Final fallback to Farmer for order: ${orderID}`);
        return 'Farmer';
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchBillingDetails = async (userID: string) => {
        if (!userID || userID === 'undefined' || userID === 'null') {
            console.error('Invalid userID provided to fetchBillingDetails:', userID);
            showToast('Invalid user session. Please log in again.', 'error');
            return;
        }

        try {
            console.log('Fetching billing details for userID:', userID);
            const result = await makeAPIRequest(`http://localhost:8081/api/user/viewUserDetails/${userID}`);

            if (result.success && result.data?.userDetailsGetResponse?.length > 0) {
                const userDetails = result.data.userDetailsGetResponse[0];

                setBillingDetails({
                    firstName: userDetails.userFirstName || userDetails.user?.firstName || '',
                    lastName: userDetails.userLastName || userDetails.user?.lastName || '',
                    country: userDetails.country || '',
                    date: '',
                    mobileNumber: userDetails.mobile || '',
                    postcode: userDetails.postalCode || '',
                    address: userDetails.address || ''
                });
            } else {
                console.log('No user details found in API response');
                if (!result.success) {
                    showToast('Failed to load existing billing details', 'error');
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

        if (!userID || userID === 'undefined' || userID === 'null') {
            showToast('User session invalid. Please log in again.', 'error');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Save billing details with correct backend structure
            const billingPayload = {
                address: billingDetails.address,
                userFirstName: billingDetails.firstName,
                userLastName: billingDetails.lastName,
                addedDate: new Date().toISOString(), // Current date in ISO format
                postalCode: billingDetails.postcode,
                mobile: billingDetails.mobileNumber,
                country: billingDetails.country
            };

            console.log('💾 Saving billing details with payload:', billingPayload);

            const billingResult = await makeAPIRequest('http://localhost:8081/api/user/userBillingDetails', {
                method: 'POST',
                body: JSON.stringify(billingPayload)
            });

            if (!billingResult.success) {
                showToast(`Failed to save billing details: ${billingResult.error}`, 'error');
                return;
            }

            console.log('✅ Billing details saved successfully');

            // Step 2: Fetch order details (price and quantity) for each order
            console.log('🔍 Fetching order details for price and quantity...');
            const ordersWithDetails: OrderItem[] = [];

            for (const order of orderIDs) {
                const orderDetails = await fetchOrderDetails(order);
                if (orderDetails) {
                    ordersWithDetails.push({
                        ...order,
                        price: orderDetails.price,
                        quantity: orderDetails.quantity
                    });
                } else {
                    // Use default values if unable to fetch details
                    console.warn(`⚠️ Using default values for order ${order.orderID}`);
                    ordersWithDetails.push({
                        ...order,
                        price: 0,
                        quantity: 1
                    });
                }
            }

            // Step 3: Save order details to userOrderDetails API
            const orderDetailsSaved = await saveOrderDetails(ordersWithDetails);

            if (!orderDetailsSaved) {
                // Even if order details saving fails, we can continue to payment
                console.warn('⚠️ Order details saving failed, but continuing to payment step');
            }

            // Update the orderIDs state with detailed information
            setOrderIDs(ordersWithDetails);

            showToast('Billing details saved successfully!', 'success');
            setCurrentStep(2);

        } catch (error: any) {
            console.error('Error in saveBillingDetails:', error);
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
        console.log('🚀 Starting enhanced payment process...');

        if (!validateCreditCard()) {
            console.error('❌ Credit card validation failed');
            return;
        }

        if (!userID || userID === 'undefined' || userID === 'null' || userID.toString().trim() === '') {
            console.error('❌ Invalid user session');
            showToast('User session invalid. Please log in again.', 'error');
            return;
        }

        if (!orderIDs || !Array.isArray(orderIDs) || orderIDs.length === 0) {
            console.error('❌ No orders found to process');
            showToast('No orders found. Please add items to your cart.', 'error');
            return;
        }

        const validOrders = orderIDs.filter(order => {
            if (!order || !order.orderID || !order.type) {
                console.warn('⚠️ Invalid order structure:', order);
                return false;
            }
            if (!['Farmer', 'SeedsAndFertilizerSeller'].includes(order.type)) {
                console.warn('⚠️ Unknown order type:', order.type);
                return false;
            }
            return true;
        });

        if (validOrders.length === 0) {
            console.error('❌ No valid orders found');
            showToast('Invalid order data. Please refresh and try again.', 'error');
            return;
        }

        console.log(`✅ Processing ${validOrders.length} valid orders`);
        setLoading(true);

        try {
            // Step 1: Save payment details with correct backend structure
            const paymentPayload = {
                userName: creditCardDetails.name,
                cardNumber: parseInt(creditCardDetails.cardNumber.replace(/\s/g, '')), // Convert to long (number)
                cvcNumber: parseInt(creditCardDetails.cvc), // Convert to int
                expiryMonth: parseInt(creditCardDetails.expiryMonth), // Convert to int
                expiryYear: parseInt(creditCardDetails.expiryYear) // Convert to int
            };

            console.log('💳 Saving payment details with payload:', paymentPayload);

            const paymentDetailsResult = await makeAPIRequest('http://localhost:8081/api/user/userPayments', {
                method: 'POST',
                body: JSON.stringify(paymentPayload)
            });

            if (!paymentDetailsResult.success) {
                showToast(`Failed to save payment details: ${paymentDetailsResult.error}`, 'error');
                return;
            }

            console.log('✅ Payment details saved successfully');

            // Step 2: Process each order payment
            const paymentResults = await Promise.all(
                validOrders.map(async (order, index) => {
                    const orderNumber = index + 1;
                    console.log(`📦 Processing order ${orderNumber}/${validOrders.length}:`, {
                        orderID: order.orderID,
                        type: order.type
                    });

                    let endpoint = '';
                    if (order.type === 'Farmer') {
                        endpoint = `http://localhost:8081/api/user/consumer-payment/${order.orderID}/confirm`;
                    } else if (order.type === 'SeedsAndFertilizerSeller') {
                        endpoint = `http://localhost:8081/api/user/consumerSeeds-payment/${order.orderID}/confirm`;
                    }

                    if (!endpoint) {
                        throw new Error(`No endpoint configured for order type: ${order.type}`);
                    }

                    const orderPaymentPayload = {
                        userID: userID.toString(),
                        orderID: order.orderID.toString(),
                        ...creditCardDetails,
                        timestamp: new Date().toISOString()
                    };

                    console.log(`💳 Sending payment request for order ${order.orderID}...`);

                    const result = await makeAPIRequest(endpoint, {
                        method: 'PUT',
                        body: JSON.stringify(orderPaymentPayload)
                    });

                    if (!result.success) {
                        throw new Error(`Payment failed for order ${order.orderID}: ${result.error}`);
                    }

                    console.log(`✅ Payment successful for order ${order.orderID}:`, result.data);
                    return {
                        success: true,
                        orderID: order.orderID,
                        type: order.type,
                        data: result.data
                    };
                })
            );

            console.log('🎉 All payments completed successfully:', paymentResults);

            const farmerOrders = paymentResults.filter(r => r.type === 'Farmer').length;
            const seedsOrders = paymentResults.filter(r => r.type === 'SeedsAndFertilizerSeller').length;

            let successMessage = `Payment successful! ${paymentResults.length} order(s) confirmed.`;
            if (farmerOrders > 0 && seedsOrders > 0) {
                successMessage += ` (${farmerOrders} farmer order(s), ${seedsOrders} seeds/fertilizer order(s))`;
            }

            showToast(successMessage, 'success');

            console.log('🔄 Redirecting to orders dashboard...');
            setTimeout(() => {
                // Add your redirect logic here
                // window.location.href = '/orders';
            }, 2000);

        } catch (error: any) {
            console.error('💥 Payment processing failed:', error);
            showToast(error.message || 'Payment failed. Please try again.', 'error');
        } finally {
            setLoading(false);
            console.log('🏁 Payment process completed');
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
                        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-[#7FB542]' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                currentStep >= 1 ? 'bg-[#7FB542] text-white' : 'bg-gray-200'
                            }`}>
                                1
                            </div>
                            <span className="font-medium">Billing Details</span>
                        </div>
                        <div className="w-16 h-0.5 bg-gray-300"></div>
                        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-[#7FB542]' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                currentStep >= 2 ? 'bg-[#7FB542] text-white' : 'bg-gray-200'
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
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#7FB542] outline-none w-full"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={billingDetails.lastName}
                                    onChange={(e) => handleBillingChange('lastName', e.target.value)}
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#7FB542] outline-none w-full"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={billingDetails.country}
                                    onChange={(e) => handleBillingChange('country', e.target.value)}
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#7FB542] outline-none w-full"
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="date"
                                    placeholder="Date"
                                    value={billingDetails.date}
                                    onChange={(e) => handleBillingChange('date', e.target.value)}
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#7FB542] outline-none w-full"
                                />
                                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={billingDetails.mobileNumber}
                                    onChange={(e) => handleBillingChange('mobileNumber', e.target.value)}
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#7FB542] outline-none w-full"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Postcode/ZIP"
                                    value={billingDetails.postcode}
                                    onChange={(e) => handleBillingChange('postcode', e.target.value)}
                                    className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#7FB542] outline-none w-full"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <textarea
                                placeholder="Address"
                                value={billingDetails.address}
                                onChange={(e) => handleBillingChange('address', e.target.value)}
                                rows={4}
                                className="p-3 bg-white border-t border-r border-l font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#7FB542] outline-none w-full resize-none"
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

                {/* Credit Card Details Form - Updated Design */}
                {currentStep === 2 && (
                    <div className="bg-white rounded-[30px] shadow-lg p-8 max-w-2xl mx-auto">
                        <div className="bg-[#7FB542] text-white text-center py-4 rounded-[20px] mb-8">
                            <h2 className="text-2xl font-semibold">Credit Card Details</h2>
                        </div>

                        <div className="space-y-8">
                            {/* Card Number Section */}
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Card Number</h3>
                                    <p className="text-sm text-gray-500">Enter the 16-digit card number on the card</p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="1234    1234    1234    1234"
                                        value={creditCardDetails.cardNumber}
                                        onChange={(e) => handleCreditCardChange('cardNumber', e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[20px] text-lg font-mono tracking-wider focus:ring-2 focus:ring-[#7FB542] focus:border-transparent outline-none pr-40"
                                    />
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2">
                                        <div className="w-8 h-5 bg-red-500 rounded-sm flex items-center justify-center">
                                            <div className="w-4 h-3 bg-red-600 rounded-full opacity-80"></div>
                                        </div>
                                        <div className="w-8 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                                            VISA
                                        </div>
                                        <div className="w-8 h-5 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                                            AMEX
                                        </div>
                                        <div className="w-8 h-5 bg-orange-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                                            DISC
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Name Section */}
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Name</h3>
                                    <p className="text-sm text-gray-500">Enter name of your card</p>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter cardholder name"
                                    value={creditCardDetails.name}
                                    onChange={(e) => handleCreditCardChange('name', e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[20px] text-lg focus:ring-2 focus:ring-[#7FB542] focus:border-transparent outline-none"
                                />
                            </div>

                            {/* CVC and Expiry Date Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* CVC Section */}
                                <div>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">CVC Number</h3>
                                        <p className="text-sm text-gray-500">Enter the 3-digit number on the card</p>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="123"
                                            value={creditCardDetails.cvc}
                                            onChange={(e) => handleCreditCardChange('cvc', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[20px] text-lg font-mono focus:ring-2 focus:ring-[#7FB542] focus:border-transparent outline-none pr-12"
                                            maxLength={3}
                                        />
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-300 rounded px-2 py-1">
                                            <span className="text-xs font-bold text-gray-600">123</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expiry Date Section */}
                                <div>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Expiry Date</h3>
                                        <p className="text-sm text-gray-500">Enter the expiration date of the card</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <input
                                            type="text"
                                            placeholder="MM"
                                            value={creditCardDetails.expiryMonth}
                                            onChange={(e) => handleCreditCardChange('expiryMonth', e.target.value)}
                                            className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-[20px] text-lg font-mono text-center focus:ring-2 focus:ring-[#7FB542] focus:border-transparent outline-none"
                                            maxLength={2}
                                        />
                                        <div className="flex items-center">
                                            <span className="text-2xl font-bold text-gray-400">/</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="YY"
                                            value={creditCardDetails.expiryYear}
                                            onChange={(e) => handleCreditCardChange('expiryYear', e.target.value)}
                                            className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-[20px] text-lg font-mono text-center focus:ring-2 focus:ring-[#7FB542] focus:border-transparent outline-none"
                                            maxLength={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-12 flex space-x-4">
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