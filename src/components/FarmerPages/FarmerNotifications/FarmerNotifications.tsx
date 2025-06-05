import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, ShoppingCart, User, Calendar, DollarSign, Package, Eye, CheckCircle, Clock } from 'lucide-react';
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
    customerName: string;
    customerEmail: string;
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
    sfOrderGetResponse?: RawOrder[];
    supermarketOrderGetResponse?: RawOrder[];
    trainerOrderGetResponse?: RawOrder[];
}

const NotificationSystem = () => {
    const [newOrderNotifications, setNewOrderNotifications] = useState<NotificationData[]>([]);
    const [paidOrderNotifications, setPaidOrderNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'new' | 'paid'>('new');
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
                `http://localhost:8081/api/user/viewConsumerOrdersByFarmerID/${userID}`,
                `http://localhost:8081/api/user/viewSFOrdersByFarmerID/${userID}`,
                `http://localhost:8081/api/user/viewSupermarketOrdersByFarmerID/${userID}`,
                `http://localhost:8081/api/user/viewTrainerOrdersByFarmerID/${userID}`
            ];

            const responses = await Promise.allSettled(
                apiEndpoints.map(url => axios.get<ApiResponse>(url))
            );

            const newOrderNotifications: NotificationData[] = [];
            const paidOrderNotifications: NotificationData[] = [];

            responses.forEach((response, index) => {
                if (response.status === 'fulfilled' && response.value.data) {
                    const data = response.value.data;

                    // Map response arrays to notification types
                    const responseKeys: (keyof ApiResponse)[] = [
                        'consumerOrderGetResponse',
                        'sfOrderGetResponse',
                        'supermarketOrderGetResponse',
                        'trainerOrderGetResponse'
                    ];

                    const orderTypes = [
                        'Consumer',
                        'Seeds & Fertilizer Seller',
                        'Supermarket',
                        'Trainer'
                    ];

                    const orders = data[responseKeys[index]];

                    if (orders && Array.isArray(orders)) {
                        orders.forEach(order => {
                            // Check if this order belongs to the current farmer
                            const farmerUserID = order.farmerProduct?.user?.userID;

                            if (farmerUserID && farmerUserID.toString() === userID.toString() &&
                                order.active === true &&
                                order.confirmed === false &&
                                order.addedToCart === false &&
                                order.removedFromCart === false &&
                                order.rejected === false) {

                                const notificationData: NotificationData = {
                                    id: `${orderTypes[index]}-${order.orderID}`,
                                    type: orderTypes[index],
                                    orderID: order.orderID,
                                    productName: order.productName,
                                    customerName: `${order.user.firstName} ${order.user.lastName}`,
                                    customerEmail: order.user.userEmail,
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

                                // Filter for new orders (paid: false)
                                if (order.paid === false) {
                                    newOrderNotifications.push(notificationData);
                                }

                                // Filter for paid orders (paid: true)
                                if (order.paid === true) {
                                    paidOrderNotifications.push(notificationData);
                                }
                            }
                        });
                    }
                }
            });

            // Sort notifications by date (newest first)
            newOrderNotifications.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
            paidOrderNotifications.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());

            setNewOrderNotifications(newOrderNotifications);
            setPaidOrderNotifications(paidOrderNotifications);

            // Total unread count (both new orders and paid orders)
            const totalUnread = newOrderNotifications.length + paidOrderNotifications.length;
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
        // Format the order data for the management table
        const orderForTable = {
            id: notification.id,
            orderID: notification.orderID,
            type: notification.type,
            productName: notification.productName,
            category: notification.category,
            customerName: notification.customerName,
            customerEmail: notification.customerEmail,
            quantity: notification.quantity,
            price: notification.price,
            addedDate: notification.addedDate,
            description: notification.description,
            rawOrder: notification.rawOrder
        };

        // Navigate directly to the order management table with the selected order
        const encodedOrder = encodeURIComponent(JSON.stringify(orderForTable));
        router.push(`/farmerOrderManagement?farmerOrderManagement=${encodedOrder}`);

        // Close the notification panel
        setIsOpen(false);
    };

    const getNotificationIcon = (type: string) => {
        const iconProps = {size: 20, className: "text-white"};
        switch (type) {
            case 'Consumer':
                return <User {...iconProps} />;
            case 'Seeds & Fertilizer Seller':
                return <Package {...iconProps} />;
            case 'Supermarket':
                return <ShoppingCart {...iconProps} />;
            case 'Trainer':
                return <User {...iconProps} />;
            default:
                return <Bell {...iconProps} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Consumer':
                return 'bg-blue-500';
            case 'Seeds & Fertilizer Seller':
                return 'bg-green-500';
            case 'Supermarket':
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

    const renderNotificationCard = (notification: NotificationData, isPaid = false) => {
        console.log('Rendering notification card:', notification);
        console.log('Notification addedDate:', notification.addedDate, 'Type:', typeof notification.addedDate);

        return (
            <div
                key={notification.id}
                onClick={() => !isPaid && handleNotificationClick(notification)}
                className={`relative p-4 mb-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group ${
                    !isPaid ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{
                    background: isPaid
                        ? 'linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: isPaid
                        ? '1px solid rgba(34, 197, 94, 0.2)'
                        : '1px solid rgba(136, 195, 78, 0.1)'
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
                        {isPaid ? (
                            <>
                                <CheckCircle size={16} className="text-green-500"/>
                                <span
                                    className="text-xs font-poppins-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                PAID
                            </span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span
                                    className="text-xs font-poppins-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                NEW
                            </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className={`${isPaid ? 'bg-green-50' : 'bg-gray-50'} rounded-lg p-3 mb-3`}>
                    <div className="flex items-center space-x-2 mb-2">
                        <Package size={16} className={isPaid ? "text-green-600" : "text-[#88C34E]"}/>
                        <span className="font-poppins-bold text-gray-800 text-sm">
                        {notification.productName}
                    </span>
                    </div>
                    <p className="text-xs text-gray-600 font-poppins-regular">
                        {notification.description}
                    </p>
                    {isPaid && (
                        <div className="mt-2 flex items-center space-x-1">
                            <CheckCircle size={14} className="text-green-600"/>
                            <span className="text-xs font-poppins-bold text-green-700">
                            Successfully paid by customer
                        </span>
                        </div>
                    )}
                    {!isPaid && (
                        <div className="mt-2 flex items-center space-x-1">
                            <Eye size={14} className="text-blue-600"/>
                            <span className="text-xs font-poppins-bold text-blue-700">
                            Click to manage this order
                        </span>
                        </div>
                    )}
                </div>

                {/* Customer & Order Details */}
                <div className="grid grid-cols-2 gap-3 text-xs font-poppins-regular">
                    <div className="flex items-center space-x-2">
                        <User size={14} className="text-blue-500"/>
                        <div>
                            <p className="text-gray-500">Customer</p>
                            <p className="font-poppins-bold text-gray-800">{notification.customerName}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-green-500"/>
                        <div>
                            <p className="text-gray-500">{isPaid ? 'Paid Date' : 'Order Date'}</p>
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
                        <DollarSign size={14} className={isPaid ? "text-green-600" : "text-purple-500"}/>
                        <div>
                            <p className="text-gray-500">{isPaid ? 'Amount Received' : 'Price'}</p>
                            <p className={`font-poppins-bold ${isPaid ? 'text-green-700' : 'text-gray-800'}`}>
                                Rs. {notification.price.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Hover Effect Overlay */}
                <div
                    className={`absolute inset-0 ${isPaid ? 'bg-gradient-to-r from-green-500/5' : 'bg-gradient-to-r from-[#88C34E]/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none`}></div>
            </div>
        );
    };

    const currentNotifications = activeTab === 'new' ? newOrderNotifications : paidOrderNotifications;

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
                             background: 'linear-gradient(135deg, #88C34E 0%, #7AB048 100%)'
                         }}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                    <Bell size={20} className="text-white"/>
                                </div>
                                <div>
                                    <h3 className="font-poppins-bold text-xl text-white">
                                        Order Notifications
                                    </h3>
                                    <p className="text-white/80 text-sm font-poppins-regular">
                                        {newOrderNotifications.length} new, {paidOrderNotifications.length} paid
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
                            onClick={() => setActiveTab('new')}
                            className={`flex-1 py-3 px-4 text-sm font-poppins-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
                                activeTab === 'new'
                                    ? 'bg-white text-[#88C34E] border-b-2 border-[#88C34E]'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <Clock size={16}/>
                            <span>New Orders ({newOrderNotifications.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('paid')}
                            className={`flex-1 py-3 px-4 text-sm font-poppins-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
                                activeTab === 'paid'
                                    ? 'bg-white text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <CheckCircle size={16}/>
                            <span>Paid Orders ({paidOrderNotifications.length})</span>
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div
                        className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="relative">
                                    <div
                                        className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#88C34E]"></div>
                                    <div
                                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#88C34E]/20 animate-pulse"></div>
                                </div>
                                <p className="mt-4 text-gray-500 font-poppins-regular">Loading notifications...</p>
                            </div>
                        ) : currentNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="relative mb-4">
                                    <div
                                        className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                        {activeTab === 'new' ? (
                                            <Clock size={32} className="text-gray-400"/>
                                        ) : (
                                            <CheckCircle size={32} className="text-gray-400"/>
                                        )}
                                    </div>
                                    <div
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                </div>
                                <p className="text-gray-500 font-poppins-regular text-lg mb-2">
                                    {activeTab === 'new' ? 'All caught up!' : 'No paid orders yet!'}
                                </p>
                                <p className="text-gray-400 font-poppins-regular text-sm">
                                    {activeTab === 'new'
                                        ? 'No new orders at the moment'
                                        : 'No payments received yet'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="p-2">
                                {currentNotifications.map((notification) =>
                                    renderNotificationCard(notification, activeTab === 'paid')
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {(newOrderNotifications.length > 0 || paidOrderNotifications.length > 0) && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => {
                                    router.push('/farmerOrderManagement');
                                    setIsOpen(false);
                                }}
                                className="w-full py-3 px-4 bg-gradient-to-r from-[#88C34E] to-[#7AB048] text-white font-poppins-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                                <Eye size={18}/>
                                <span>View Order Management</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationSystem;