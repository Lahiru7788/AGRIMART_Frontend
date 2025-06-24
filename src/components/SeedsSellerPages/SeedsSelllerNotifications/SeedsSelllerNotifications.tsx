import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, ShoppingCart, User, Calendar, DollarSign, Package, Eye, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { getWithExpiry } from '../../../../auth-utils';
import { useRouter } from 'next/navigation';

// Define proper TypeScript interfaces
interface OrderUser {
    userID: number;
    firstName: string;
    lastName: string;
    userEmail: string;
    userType?: string;
}

interface FarmerProduct {
    user: OrderUser;
    productCategory?: string;
}

interface SFProduct {
    productID: number;
    productName: string;
    price: number;
    availableQuantity: number;
    minimumQuantity: number;
    description: string;
    addedDate: string;
    productCategory: string;
    user: OrderUser;
    active: boolean;
    quantityLowered: boolean;
    deleted: boolean;
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

interface FarmerSeedsOrder {
    orderID: number;
    productID: number;
    productName: string;
    price: number;
    requiredQuantity: number;
    description: string;
    addedDate: string;
    productCategory: string;
    user: OrderUser;
    sfProduct: SFProduct;
    active: boolean;
    confirmed: boolean;
    addedToCart: boolean;
    removedFromCart: boolean;
    rejected: boolean;
    paid: boolean;
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
    rawOrder?: RawOrder;
    farmerSeedsOrder?: FarmerSeedsOrder;
    productID?: number;
    sellerName?: string;
}

interface ApiResponse {
    consumerOrderGetResponse?: RawOrder[];
    sfOrderGetResponse?: RawOrder[];
    supermarketOrderGetResponse?: RawOrder[];
    trainerOrderGetResponse?: RawOrder[];
    farmerSeedsOrderGetResponse?: FarmerSeedsOrder[];
}

const NotificationSystem = () => {
    const [newOrderNotifications, setNewOrderNotifications] = useState<NotificationData[]>([]);
    const [paidOrderNotifications, setPaidOrderNotifications] = useState<NotificationData[]>([]);
    const [confirmedOrderNotifications, setConfirmedOrderNotifications] = useState<NotificationData[]>([]);
    const [rejectedOrderNotifications, setRejectedOrderNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'new' | 'paid' | 'confirmed' | 'rejected'>('new');
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

            // Fetch from all five APIs (including farmer seeds orders)
            const apiEndpoints = [
                `http://localhost:8081/api/user/viewConsumerOrdersByFarmerID/${userID}`,
                `http://localhost:8081/api/user/viewSFOrdersByFarmerID/${userID}`,
                `http://localhost:8081/api/user/viewSupermarketOrdersByFarmerID/${userID}`,
                `http://localhost:8081/api/user/viewTrainerOrdersByFarmerID/${userID}`,
                `http://localhost:8081/api/user/viewFarmerSeedsOrdersByFarmerID/${userID}`
            ];

            const responses = await Promise.allSettled(
                apiEndpoints.map(url => axios.get<ApiResponse>(url))
            );

            const newOrderNotifications: NotificationData[] = [];
            const paidOrderNotifications: NotificationData[] = [];
            const confirmedOrderNotifications: NotificationData[] = [];
            const rejectedOrderNotifications: NotificationData[] = [];

            responses.forEach((response, index) => {
                if (response.status === 'fulfilled' && response.value.data) {
                    const data = response.value.data;

                    // Handle farmer orders (first 4 APIs)
                    if (index < 4) {
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

                                if (farmerUserID && farmerUserID.toString() === userID.toString() && order.active === true) {
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

                                    // Filter for new orders: confirmed=false, rejected=false, addedToCart=false, removedFromCart=false, paid=false
                                    if (order.confirmed === false && order.rejected === false &&
                                        order.addedToCart === false && order.removedFromCart === false && order.paid === false) {
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
                    // Handle farmer seeds orders (5th API) - ONLY for confirmed and rejected
                    else if (index === 4) {
                        const farmerSeedsOrders = data.farmerSeedsOrderGetResponse;

                        if (farmerSeedsOrders && Array.isArray(farmerSeedsOrders)) {
                            farmerSeedsOrders.forEach(order => {
                                // Only include orders that belong to the current farmer
                                if (order.user.userID.toString() === userID.toString() && order.active === true) {
                                    const notificationData: NotificationData = {
                                        id: `FarmerSeeds-${order.orderID}`,
                                        type: 'Seeds & Fertilizer Seller',
                                        orderID: order.orderID,
                                        productName: order.productName,
                                        customerName: `${order.sfProduct.user.firstName} ${order.sfProduct.user.lastName}`,
                                        customerEmail: order.sfProduct.user.userEmail,
                                        sellerName: `${order.sfProduct.user.firstName} ${order.sfProduct.user.lastName}`,
                                        quantity: order.requiredQuantity,
                                        price: order.price,
                                        addedDate: new Date(order.addedDate),
                                        confirmed: order.confirmed,
                                        paid: order.paid,
                                        rejected: order.rejected,
                                        description: order.description,
                                        category: order.productCategory,
                                        farmerSeedsOrder: order,
                                        productID: order.sfProduct.productID
                                    };

                                    // Filter for confirmed orders from Seeds & Fertilizer Seller
                                    if (order.confirmed === true && order.rejected === false &&
                                        order.addedToCart === false && order.removedFromCart === false && order.paid === false) {
                                        confirmedOrderNotifications.push(notificationData);
                                    }

                                    // Filter for rejected orders from Seeds & Fertilizer Seller
                                    if (order.confirmed === false && order.rejected === true &&
                                        order.addedToCart === false && order.removedFromCart === false && order.paid === false) {
                                        rejectedOrderNotifications.push(notificationData);
                                    }
                                }
                            });
                        }
                    }
                }
            });

            // Sort notifications by date (newest first)
            newOrderNotifications.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
            paidOrderNotifications.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
            confirmedOrderNotifications.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
            rejectedOrderNotifications.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());

            setNewOrderNotifications(newOrderNotifications);
            setPaidOrderNotifications(paidOrderNotifications);
            setConfirmedOrderNotifications(confirmedOrderNotifications);
            setRejectedOrderNotifications(rejectedOrderNotifications);

            // Total unread count (all notification types)
            const totalUnread = newOrderNotifications.length + paidOrderNotifications.length +
                confirmedOrderNotifications.length + rejectedOrderNotifications.length;
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
        // Handle Seeds Order notifications (redirect to farmerViewSFProductDetailsPage)
        if ((notification.type === 'Seeds & Fertilizer Seller' && (activeTab === 'confirmed' || activeTab === 'rejected')) && notification.productID) {
            router.push(`/farmerViewSFProductDetailsPage?productID=${notification.productID}`);
        } else {
            // Handle regular order notifications (redirect to order management)
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

            const encodedOrder = encodeURIComponent(JSON.stringify(orderForTable));
            router.push(`/farmerOrderManagement?farmerOrderManagement=${encodedOrder}`);
        }

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

    const getTabConfig = (tab: string) => {
        switch (tab) {
            case 'new':
                return { icon: Clock, label: 'New Orders', color: 'text-[#88C34E]', borderColor: 'border-[#88C34E]' };
            case 'paid':
                return { icon: CheckCircle, label: 'Paid Orders', color: 'text-green-600', borderColor: 'border-green-600' };
            case 'confirmed':
                return { icon: CheckCircle, label: 'Confirmed', color: 'text-green-600', borderColor: 'border-green-600' };
            case 'rejected':
                return { icon: XCircle, label: 'Rejected', color: 'text-red-600', borderColor: 'border-red-600' };
            default:
                return { icon: Clock, label: 'Orders', color: 'text-gray-600', borderColor: 'border-gray-600' };
        }
    };

    const renderNotificationCard = (notification: NotificationData, status: 'new' | 'paid' | 'confirmed' | 'rejected') => {
        const isConfirmed = status === 'confirmed';
        const isRejected = status === 'rejected';
        const isSeedOrder = (notification.type === 'Seeds & Fertilizer Seller' && (isConfirmed || isRejected));

        return (
            <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`relative rounded-2xl p-4 mb-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    isConfirmed ? 'bg-green-50 border border-green-200' :
                        isRejected ? 'bg-red-50 border border-red-200' :
                            'bg-white border border-gray-200'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getTypeColor(notification.type)} shadow-sm`}>
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
                    <div className="flex items-center space-x-2">
                        {isConfirmed ? (
                            <>
                                <CheckCircle size={16} className="text-green-500"/>
                                <span className="text-xs font-poppins-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                    CONFIRMED
                                </span>
                            </>
                        ) : isRejected ? (
                            <>
                                <XCircle size={16} className="text-red-500"/>
                                <span className="text-xs font-poppins-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                                    REJECTED
                                </span>
                            </>
                        ) : status === 'paid' ? (
                            <>
                                <CheckCircle size={16} className="text-green-500"/>
                                <span className="text-xs font-poppins-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                    PAID
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-poppins-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                    NEW
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Product Section */}
                <div className="flex items-start space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                        isConfirmed ? 'bg-green-100' :
                            isRejected ? 'bg-red-100' :
                                'bg-gray-100'
                    }`}>
                        <Package size={16} className={`${
                            isConfirmed ? 'text-green-600' :
                                isRejected ? 'text-red-600' :
                                    'text-gray-600'
                        }`}/>
                    </div>
                    <div className="flex-1">
                        <h5 className="font-poppins-bold text-gray-800 text-sm mb-1">
                            {notification.productName}
                        </h5>
                        <p className="text-xs text-gray-600 font-poppins-regular leading-relaxed">
                            {notification.description || 'Seed'}
                        </p>
                    </div>
                </div>

                {/* Status Message */}
                <div className={`flex items-center space-x-2 mb-4 p-2 rounded-lg ${
                    isConfirmed ? 'bg-green-100' :
                        isRejected ? 'bg-red-100' :
                            'bg-blue-50'
                }`}>
                    {isConfirmed ? (
                        <CheckCircle size={14} className="text-green-600"/>
                    ) : isRejected ? (
                        <XCircle size={14} className="text-red-600"/>
                    ) : (
                        <Eye size={14} className="text-blue-600"/>
                    )}
                    <span className={`text-xs font-poppins-bold ${
                        isConfirmed ? 'text-green-700' :
                            isRejected ? 'text-red-700' :
                                'text-blue-700'
                    }`}>
                        {isConfirmed ? 'Order confirmed by seeds & fertilizer seller' :
                            isRejected ? 'Order rejected by seeds & fertilizer seller' :
                                isSeedOrder ? 'Click to view product details' : 'Click to manage this order'}
                    </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <User size={14} className="text-blue-500"/>
                        <div>
                            <p className="text-xs text-gray-500 font-poppins-regular">
                                {isSeedOrder ? 'Seeds & Fertilizer Seller' : 'Customer'}
                            </p>
                            <p className="text-xs font-poppins-bold text-gray-800">
                                {isSeedOrder ? notification.sellerName : notification.customerName}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar size={14} className={`${
                            isConfirmed ? 'text-green-500' :
                                isRejected ? 'text-red-500' :
                                    'text-green-500'
                        }`}/>
                        <div>
                            <p className="text-xs text-gray-500 font-poppins-regular">
                                {isConfirmed ? 'Confirmed Date' :
                                    isRejected ? 'Rejected Date' :
                                        'Order Date'}
                            </p>
                            <p className="text-xs font-poppins-bold text-gray-800">
                                {formatDate(notification.addedDate)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Package size={14} className="text-orange-500"/>
                        <div>
                            <p className="text-xs text-gray-500 font-poppins-regular">Quantity</p>
                            <p className="text-xs font-poppins-bold text-gray-800">{notification.quantity} kg</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <DollarSign size={14} className={`${
                            isConfirmed ? 'text-green-600' :
                                isRejected ? 'text-red-600' :
                                    'text-purple-500'
                        }`}/>
                        <div>
                            <p className="text-xs text-gray-500 font-poppins-regular">Price</p>
                            <p className={`text-xs font-poppins-bold ${
                                isConfirmed ? 'text-green-700' :
                                    isRejected ? 'text-red-700' :
                                        'text-gray-800'
                            }`}>
                                Rs. {notification.price.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const getCurrentNotifications = () => {
        switch (activeTab) {
            case 'new':
                return { notifications: newOrderNotifications, status: 'new' as const };
            case 'paid':
                return { notifications: paidOrderNotifications, status: 'paid' as const };
            case 'confirmed':
                return { notifications: confirmedOrderNotifications, status: 'confirmed' as const };
            case 'rejected':
                return { notifications: rejectedOrderNotifications, status: 'rejected' as const };
            default:
                return { notifications: newOrderNotifications, status: 'new' as const };
        }
    };

    const { notifications: currentNotifications, status: currentStatus } = getCurrentNotifications();

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
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div
                    ref={panelRef}
                    className="absolute right-0 top-12 w-[550px] bg-white border-0 rounded-2xl shadow-2xl z-50 max-h-[600px] overflow-hidden backdrop-blur-sm"
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
                                        {newOrderNotifications.length} new, {paidOrderNotifications.length} paid, {confirmedOrderNotifications.length} confirmed, {rejectedOrderNotifications.length} rejected
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 group"
                            >
                                <X size={20} className="text-white group-hover:rotate-90 transition-transform duration-200"/>
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex bg-gray-50 border-b border-gray-200">
                        {(['new', 'paid', 'confirmed', 'rejected'] as const).map((tab) => {
                            const config = getTabConfig(tab);
                            const Icon = config.icon;
                            const count = tab === 'new' ? newOrderNotifications.length :
                                tab === 'paid' ? paidOrderNotifications.length :
                                    tab === 'confirmed' ? confirmedOrderNotifications.length :
                                        rejectedOrderNotifications.length;

                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 px-2 text-xs font-poppins-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                                        activeTab === tab
                                            ? `bg-white ${config.color} border-b-2 ${config.borderColor}`
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    <Icon size={14}/>
                                    <span>{config.label} ({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="relative">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#88C34E]"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#88C34E]/20 animate-pulse"></div>
                                </div>
                                <p className="mt-4 text-gray-500 font-poppins-regular">Loading notifications...</p>
                            </div>
                        ) : currentNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="relative mb-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                        {activeTab === 'new' ? (
                                            <Clock size={32} className="text-gray-400"/>
                                        ) : activeTab === 'confirmed' ? (
                                            <CheckCircle size={32} className="text-gray-400"/>
                                        ) : activeTab === 'rejected' ? (
                                            <XCircle size={32} className="text-gray-400"/>
                                        ) : (
                                            <CheckCircle size={32} className="text-gray-400"/>
                                        )}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#88C34E] rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                </div>
                                <p className="text-gray-500 font-poppins-regular text-lg mb-2">
                                    {activeTab === 'new' ? 'No new notifications!' :
                                        activeTab === 'confirmed' ? 'No confirmed orders!' :
                                            activeTab === 'rejected' ? 'No rejected orders!' :
                                                'No notifications!'}
                                </p>
                                <p className="text-gray-400 font-poppins-regular text-sm">
                                    {activeTab === 'new' ? 'All caught up! No new notifications to show' :
                                        activeTab === 'confirmed' ? 'No orders have been confirmed yet' :
                                            activeTab === 'rejected' ? 'No orders have been rejected yet' :
                                                'No notifications available at this time'}
                                </p>
                            </div>
                        ) : (
                            <div className="p-2">
                                {currentNotifications.map((notification) =>
                                    renderNotificationCard(notification, activeTab === 'new')
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {(newOrderNotifications.length > 0 || paidOrderNotifications.length > 0) && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => {
                                    router.push('/seedsSellerOrderManagement');
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