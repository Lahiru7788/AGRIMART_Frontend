import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, ShoppingCart, User, Calendar, DollarSign, Package, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import axios from 'axios';
import { getWithExpiry } from '../../../../auth-utils';
import { useRouter } from 'next/navigation';

// Define proper TypeScript interfaces
interface OrderUser {
    userID: number;
    firstName: string;
    lastName: string;
    userEmail: string;
}

interface FarmerProduct {
    user: OrderUser;
    productCategory?: string;
}

interface RawOrder {
    orderID: number;
    productName: string;
    user: OrderUser;
    requiredQuantity: number;
    price: number;
    addedDate: string;
    confirmed: boolean;
    paid: boolean;
    rejected: boolean;
    active: boolean;
    addedToCart: boolean;
    removedFromCart: boolean;
    description: string;
    farmerProduct?: FarmerProduct;
    productCategory?: string;
}

interface NotificationData {
    id: string;
    type: string;
    orderID: number;
    productName: string;
    productID: number;
    providerName: string;
    providerEmail: string;
    quantity: number;
    price: number;
    addedDate: Date;
    confirmed: boolean;
    paid: boolean;
    rejected: boolean;
    description: string;
    category: string;
    rawOrder: RawOrder;
}

interface ApiResponse {
    consumerOrderGetResponse?: RawOrder[];
    consumerSeedsOrderGetResponse?: RawOrder[];
    consumerCourseOrderGetResponse?: RawOrder[];
    consumerHireGetResponse?: RawOrder[];
}

const ConsumerNotificationSystem = () => {
    const [confirmedOrderNotifications, setConfirmedOrderNotifications] = useState<NotificationData[]>([]);
    const [rejectedOrderNotifications, setRejectedOrderNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'confirmed' | 'rejected'>('confirmed');
    const panelRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
        // Set up polling to check for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Close panel when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node) &&
                bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const userID = getWithExpiry('userID');

            if (!userID) {
                console.error('User ID not found');
                return;
            }

            // Fetch from all four APIs
            const apiEndpoints = [
                `http://localhost:8081/api/user/viewConsumerOrdersByConsumerID/${userID}`,
                `http://localhost:8081/api/user/viewConsumerSeedsOrdersByConsumerID/${userID}`,
                `http://localhost:8081/api/user/viewConsumerCourseOrdersByConsumerID/${userID}`,
                `http://localhost:8081/api/user/viewConsumerHireByConsumerID/${userID}`
            ];

            const responses = await Promise.allSettled(
                apiEndpoints.map(url => axios.get<ApiResponse>(url))
            );

            const confirmedOrderNotifications: NotificationData[] = [];
            const rejectedOrderNotifications: NotificationData[] = [];

            responses.forEach((response, index) => {
                if (response.status === 'fulfilled' && response.value.data) {
                    const data = response.value.data;

                    // Map response arrays to notification types
                    const responseKeys: (keyof ApiResponse)[] = [
                        'consumerOrderGetResponse',
                        'consumerSeedsOrderGetResponse',
                        'consumerCourseOrderGetResponse',
                        'consumerHireGetResponse'
                    ];

                    const orderTypes = [
                        'Farmer',
                        'Seeds & Fertilizer Seller',
                        'Course',
                        'Trainer'
                    ];

                    const orders = data[responseKeys[index]];

                    if (orders && Array.isArray(orders)) {
                        orders.forEach(order => {
                            // Check if this order belongs to the current consumer
                            const consumerUserID = order.user?.userID;

                            if (consumerUserID && consumerUserID.toString() === userID.toString() &&
                                order.active === true && order.addedToCart === false  &&
                                order.removedFromCart === false &&
                                (order.confirmed === true || order.rejected === true)) {

                                const notificationData: NotificationData = {
                                    id: `${orderTypes[index]}-${order.orderID}`,
                                    type: orderTypes[index],
                                    orderID: order.orderID,
                                    productName: order.productName,
                                    productID: order.farmerProduct.productID,
                                    providerName: order.farmerProduct?.user
                                        ? `${order.farmerProduct.user.firstName} ${order.farmerProduct.user.lastName}`
                                        : 'Provider Name',
                                    providerEmail: order.farmerProduct?.user?.userEmail || 'Provider Email',
                                    quantity: order.requiredQuantity,
                                    price: order.price,
                                    addedDate: new Date(order.addedDate),
                                    confirmed: order.confirmed,
                                    paid: order.paid,
                                    rejected: order.rejected,
                                    description: order.description,
                                    category: order.farmerProduct?.productCategory || order.productCategory || 'N/A',
                                    rawOrder: order
                                };

                                // Filter for confirmed orders
                                if (order.confirmed === true) {
                                    confirmedOrderNotifications.push(notificationData);
                                }

                                // Filter for rejected orders
                                if (order.rejected === true) {
                                    rejectedOrderNotifications.push(notificationData);
                                }
                            }
                        });
                    }
                }
            });

            // Sort notifications by date (newest first)
            confirmedOrderNotifications.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
            rejectedOrderNotifications.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());

            setConfirmedOrderNotifications(confirmedOrderNotifications);
            setRejectedOrderNotifications(rejectedOrderNotifications);

            // Total unread count (both confirmed and rejected orders)
            const totalUnread = confirmedOrderNotifications.length + rejectedOrderNotifications.length;
            setUnreadCount(totalUnread);

        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBellClick = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (notification: NotificationData) => {
        // Format the order data for the consumer order view
        const orderForView = {
            id: notification.id,
            orderID: notification.orderID,
            type: notification.type,
            productName: notification.productName,
            productID: notification.productID,
            category: notification.category,
            providerName: notification.providerName,
            providerEmail: notification.providerEmail,
            quantity: notification.quantity,
            price: notification.price,
            addedDate: notification.addedDate,
            description: notification.description,
            confirmed: notification.confirmed,
            rejected: notification.rejected,
            rawOrder: notification.rawOrder
        };

        // Navigate to consumer order view page with both orderDetails and productID
        const encodedOrder = encodeURIComponent(JSON.stringify(orderForView));
        router.push(`/consumerViewProductDetailsPage?orderDetails=${encodedOrder}&productID=${notification.productID}`);

        // Close the notification panel
        setIsOpen(false);
    };

    const getNotificationIcon = (type: string) => {
        const iconProps = {size: 20, className: "text-white"};
        switch (type) {
            case 'Farmer':
                return <User {...iconProps} />;
            case 'Seeds & Fertilizer Seller':
                return <Package {...iconProps} />;
            case 'Course':
                return <Calendar {...iconProps} />;
            case 'Trainer':
                return <User {...iconProps} />;
            default:
                return <Bell {...iconProps} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Farmer':
                return 'bg-blue-500';
            case 'Seeds & Fertilizer Seller':
                return 'bg-green-500';
            case 'Course':
                return 'bg-purple-500';
            case 'Trainer':
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    };

    const formatDate = (date: Date | string | number | null | undefined): string => {
        // Handle null, undefined, or empty values
        if (!date) {
            return 'No Date';
        }

        try {
            // Ensure we have a Date object
            const dateObj = date instanceof Date ? date : new Date(date);

            // Check if the date is valid
            if (isNaN(dateObj.getTime())) {
                return 'Invalid Date';
            }

            return dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error, 'Date value:', date);
            return 'Invalid Date';
        }
    };

    const renderNotificationCard = (notification: NotificationData, isRejected = false) => {
        console.log('Rendering notification card:', notification);
        console.log('Notification addedDate:', notification.addedDate, 'Type:', typeof notification.addedDate);

        return (
            <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`relative p-4 mb-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group cursor-pointer`}
                style={{
                    background: isRejected
                        ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: isRejected
                        ? '1px solid rgba(239, 68, 68, 0.2)'
                        : '1px solid rgba(34, 197, 94, 0.2)'
                }}
            >
                {/* Order Type Badge */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getTypeColor(notification.type)} shadow-lg`}>
                            {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                            <h4 className="font-poppins-bold text-gray-800 text-base">
                                {notification.type} Order
                            </h4>
                            <p className="font-poppins-regular text-xs text-gray-500">
                                Order #{notification.orderID}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        {isRejected ? (
                            <>
                                <XCircle size={16} className="text-red-500"/>
                                <span
                                    className="text-xs font-poppins-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                REJECTED
                            </span>
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} className="text-green-500"/>
                                <span
                                    className="text-xs font-poppins-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                CONFIRMED
                            </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className={`${isRejected ? 'bg-red-50' : 'bg-green-50'} rounded-lg p-3 mb-3`}>
                    <div className="flex items-center space-x-2 mb-2">
                        <Package size={16} className={isRejected ? "text-red-600" : "text-green-600"}/>
                        <span className="font-poppins-bold text-gray-800 text-sm">
                        {notification.productName}
                    </span>
                    </div>
                    <p className="text-xs text-gray-600 font-poppins-regular">
                        {notification.description}
                    </p>
                    {isRejected ? (
                        <div className="mt-2 flex items-center space-x-1">
                            <XCircle size={14} className="text-red-600"/>
                            <span className="text-xs font-poppins-bold text-red-700">
                            Order rejected by {notification.type.toLowerCase()}
                        </span>
                        </div>
                    ) : (
                        <div className="mt-2 flex items-center space-x-1">
                            <CheckCircle size={14} className="text-green-600"/>
                            <span className="text-xs font-poppins-bold text-green-700">
                            Order confirmed by {notification.type.toLowerCase()}
                        </span>
                        </div>
                    )}
                    <div className="mt-2 flex items-center space-x-1">
                        <Eye size={14} className="text-blue-600"/>
                        <span className="text-xs font-poppins-bold text-blue-700">
                        Click to view order details
                    </span>
                    </div>
                </div>

                {/* Provider & Order Details */}
                <div className="grid grid-cols-2 gap-3 text-xs font-poppins-regular">
                    <div className="flex items-center space-x-2">
                        <User size={14} className="text-blue-500"/>
                        <div>
                            <p className="text-gray-500">{notification.type}</p>
                            <p className="font-poppins-bold text-gray-800">{notification.providerName}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar size={14} className={isRejected ? "text-red-500" : "text-green-500"}/>
                        <div>
                            <p className="text-gray-500">{isRejected ? 'Rejected Date' : 'Confirmed Date'}</p>
                            <p className="font-poppins-bold text-gray-800">
                                {(() => {
                                    console.log('About to format date in render:', notification.addedDate);
                                    return formatDate(notification.addedDate);
                                })()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Package size={14} className="text-orange-500"/>
                        <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-poppins-bold text-gray-800">{notification.quantity} kg</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <DollarSign size={14} className={isRejected ? "text-red-600" : "text-green-600"}/>
                        <div>
                            <p className="text-gray-500">Price</p>
                            <p className={`font-poppins-bold ${isRejected ? 'text-red-700' : 'text-green-700'}`}>
                                Rs. {notification.price.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Hover Effect Overlay */}
                <div
                    className={`absolute inset-0 ${isRejected ? 'bg-gradient-to-r from-red-500/5' : 'bg-gradient-to-r from-green-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none`}></div>
            </div>
        );
    };

    const currentNotifications = activeTab === 'confirmed' ? confirmedOrderNotifications : rejectedOrderNotifications;

    return (
        <div className="relative">
            {/* Bell Icon with Badge */}
            <button
                ref={bellRef}
                onClick={handleBellClick}
                className="relative p-[3px] bg-white shadow-md rounded-full hover:invert transition-all duration-200"
            >
                <Bell size={35}/>
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div
                    ref={panelRef}
                    className="absolute right-0 top-12 w-[450px] bg-white border-0 rounded-2xl shadow-2xl z-50 max-h-[600px] overflow-hidden backdrop-blur-sm"
                    style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                    }}
                >
                    {/* Header */}
                    <div className="relative p-6 border-b border-gray-100"
                         style={{
                             background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                         }}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                    <Bell size={20} className="text-white"/>
                                </div>
                                <div>
                                    <h3 className="font-poppins-bold text-xl text-white">
                                        Order Updates
                                    </h3>
                                    <p className="text-white/80 text-sm font-poppins-regular">
                                        {confirmedOrderNotifications.length} confirmed, {rejectedOrderNotifications.length} rejected
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 group"
                            >
                                <X size={20}
                                   className="text-white group-hover:rotate-90 transition-transform duration-200"/>
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex bg-gray-50 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('confirmed')}
                            className={`flex-1 py-3 px-4 text-sm font-poppins-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
                                activeTab === 'confirmed'
                                    ? 'bg-white text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <CheckCircle size={16}/>
                            <span>Confirmed ({confirmedOrderNotifications.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('rejected')}
                            className={`flex-1 py-3 px-4 text-sm font-poppins-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
                                activeTab === 'rejected'
                                    ? 'bg-white text-red-600 border-b-2 border-red-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <XCircle size={16}/>
                            <span>Rejected ({rejectedOrderNotifications.length})</span>
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div
                        className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="relative">
                                    <div
                                        className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500"></div>
                                    <div
                                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500/20 animate-pulse"></div>
                                </div>
                                <p className="mt-4 text-gray-500 font-poppins-regular">Loading notifications...</p>
                            </div>
                        ) : currentNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="relative mb-4">
                                    <div
                                        className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                        {activeTab === 'confirmed' ? (
                                            <CheckCircle size={32} className="text-gray-400"/>
                                        ) : (
                                            <XCircle size={32} className="text-gray-400"/>
                                        )}
                                    </div>
                                    <div
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                </div>
                                <p className="text-gray-500 font-poppins-regular text-lg mb-2">
                                    {activeTab === 'confirmed' ? 'No confirmed orders!' : 'No rejected orders!'}
                                </p>
                                <p className="text-gray-400 font-poppins-regular text-sm">
                                    {activeTab === 'confirmed'
                                        ? 'No orders have been confirmed yet'
                                        : 'No orders have been rejected yet'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="p-2">
                                {currentNotifications.map((notification) =>
                                    renderNotificationCard(notification, activeTab === 'rejected')
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {(confirmedOrderNotifications.length > 0 || rejectedOrderNotifications.length > 0) && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => {
                                    router.push('/consumerOrders');
                                    setIsOpen(false);
                                }}
                                className="w-full py-3 px-4 bg-gradient-to-r from-[#88C34E] to-[#7AB048] text-white font-poppins-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                                <Eye size={18}/>
                                <span>View All Orders</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ConsumerNotificationSystem;