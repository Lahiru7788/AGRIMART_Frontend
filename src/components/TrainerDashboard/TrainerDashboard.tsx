"use client"

import Link from "next/link";
import { Home, PlusCircle, Package2, Eye, Users, LineChart, FileText, User, ChevronDown } from "lucide-react";
import AGRIMART from "../../../public/Images/HeaderNav/AGRIMART.png";
import Cart from "../../../public/Images/HeaderNav/icons8-cart-50.png";
import Logout from "../../../public/Images/HeaderNav/icons8-logout-50.png";
import Farmer from "../../../public/Images/HeaderNav/icons8-farmer-64.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useLogout } from "../Logout/Logout";
import axios from "axios";
import NotificationSystem from "../FarmerPages/FarmerNotifications/FarmerNotifications"; // Import the notification component

const Dashboard = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1">
                <Topbar />
                <main className="pt-3">
                    {/* Your main content goes here */}
                </main>
            </div>
        </div>
    );
};

const Sidebar = () => {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const pathname = usePathname();

    // Check if any dropdown link is active
    const isAddDropdownActive = ['/trainerAddCourses', '/trainerAddHiringService'].includes(pathname);
    const isUpdateDropdownActive = ['/trainerUpdateCourse', '/trainerUpdateHiringService'].includes(pathname);

    return (
        <aside className="w-[260px] bg-white rounded-xl shadow-lg pb-4 pl-6 pr-8 flex flex-col justify-between fixed h-screen">
            {/* Logo Section */}
            <div>
                <div className="flex items-center justify-center mt-[-20px]">
                    <Image src={AGRIMART} alt="Agrimart Logo" className="w-48" />
                </div>
                <h2 className="text-gray-500 uppercase font-poppins-bold text-sm mt-[-30px]">Menu</h2>

                {/* Menu Items */}
                <nav className="mt-4 space-y-[2px] font-poppins-regular relative">
                    <LinkItem href="/" icon={<Home size={20} />} label="Home" />

                    {/* Add Courses and Services with Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHoveredItem('add')}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        <DropdownItem
                            icon={<PlusCircle size={30} />}
                            label="Add Courses and Services"
                            isHovered={hoveredItem === 'add'}
                            isActive={isAddDropdownActive}
                        />
                        {hoveredItem === 'add' && (
                            <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg border border-gray-200 py-1 z-50 -mt-1">
                                <DropdownLink href="/trainerAddCourses" label="Add Course" />
                                <DropdownLink href="/trainerAddHiringService" label="Add Hiring Service" />
                            </div>
                        )}
                    </div>

                    {/* Update Courses and Services with Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHoveredItem('update')}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        <DropdownItem
                            icon={<Package2 size={30} />}
                            label="Update Courses and Services"
                            isHovered={hoveredItem === 'update'}
                            isActive={isUpdateDropdownActive}
                        />
                        {hoveredItem === 'update' && (
                            <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg border border-gray-200 py-1 z-50 -mt-1">
                                <DropdownLink href="/trainerUpdateCourses" label="Update Course" />
                                <DropdownLink href="/trainerUpdateHiringService" label="Update Hiring Service" />
                            </div>
                        )}
                    </div>

                    <LinkItem href="/farmerViewOrders" icon={<Eye size={20} />} label="View Order" />
                    <LinkItem href="/customers" icon={<Users size={20} />} label="Customers" />
                    <LinkItem href="/sales" icon={<LineChart size={20} />} label="Sales" />
                    <LinkItem href="/reports" icon={<FileText size={20} />} label="Reports" />
                </nav>
            </div>

            {/* Bottom Button */}
            <div className="bg-[#88C34E] mt-[20px] font-poppins-regular rounded-full rounded-bl-none text-white text-center p-3 text-xs font-semibold">
                If you need to purchase products,, <br />
                <Link href="/trainerViewFarmerProducts" className="font-coiny mt-[5px] text-[15px]">Click Here</Link>
            </div>
        </aside>
    );
};

const Topbar = () => {
    const { handleLogout } = useLogout();
    const [userName, setUserName] = useState("User");
    const [userID, setUserID] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        // Get user name and ID from session storage when component mounts
        const userNameItem = sessionStorage.getItem('userName');
        const userIDItem = sessionStorage.getItem('userID');

        if (userNameItem) {
            try {
                const parsedItem = JSON.parse(userNameItem);
                if (parsedItem.value && Date.now() < parsedItem.expiry) {
                    setUserName(parsedItem.value);
                }
            } catch (e) {
                console.error("Error parsing user name from session storage:", e);
            }
        }

        if (userIDItem) {
            try {
                const parsedItem = JSON.parse(userIDItem);
                if (parsedItem.value && Date.now() < parsedItem.expiry) {
                    setUserID(parsedItem.value);
                }
            } catch (e) {
                console.error("Error parsing user ID from session storage:", e);
            }
        }
    }, []);

    useEffect(() => {
        // Fetch profile image when userID is available
        const fetchFarmerProfileImage = async (userID) => {
            try {
                setIsLoading(true);
                setImageError(false);
                const response = await axios.get(
                    `http://localhost:8081/api/user/viewUserProfile?userID=${userID}`,
                    { responseType: "blob" }
                );

                // Create a URL for the blob data
                const imageUrl = URL.createObjectURL(response.data);
                setProfileImage(imageUrl);

            } catch (error) {
                console.error(`Error fetching profile image for user ${userID}:`, error);
                setImageError(true);
                // Profile image not available, will use default icon
            } finally {
                setIsLoading(false);
            }
        };

        if (userID) {
            fetchFarmerProfileImage(userID);
        } else {
            setIsLoading(false);
        }
    }, [userID]);

    return (
        <header className="ml-[270px] fixed top-0 left-0 w-full bg-gray-100 flex items-center justify-between pl-4 pr-6 py-2 z-50">
            {/* Left Section */}
            <div className="flex items-center space-x-">
                <div className="p-2 bg-white shadow-md rounded-full border-[3px] border-[#88C34E]">
                    <Image src={Farmer} alt="Agrimart Logo" width={40} height={40} />
                </div>
                <div>
                    <h2 className="text-lg font-poppins-bold ml-[20px]">Trainer Dashboard</h2>
                    <p className="text-gray-500 font-poppins-regular ml-[20px]">See all your marketing features in here</p>
                </div>
            </div>

            {/* Right Section */}
            <div className="mr-[270px]">
                <div className="flex items-center space-x-4">
                    <button className="p-2 bg-white shadow-md rounded-full hover:invert">
                        <Image src={Cart} alt="Cart" width={25} height={25} />
                    </button>
                    <button
                        className="p-2 bg-white shadow-md rounded-full hover:invert"
                        onClick={handleLogout}
                        aria-label="Logout"
                    >
                        <Image src={Logout} alt="Logout" width={25} height={25} />
                    </button>

                    {/* Notification System Component */}
                    <NotificationSystem />

                    {/* Profile Link with enhanced profile image display */}
                    <Link
                        href="/trainerProfile"
                        className="relative bg-white shadow-md rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_8px_rgba(136,195,78,0.8)]"
                        style={{ width: "40px", height: "40px" }}
                    >
                        {isLoading ? (
                            // Loading state
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#88C34E] rounded-full animate-spin"></div>
                            </div>
                        ) : profileImage && !imageError ? (
                            // Show profile image if available and no error
                            <div className="w-full h-full relative">
                                <Image
                                    src={profileImage}
                                    alt="User Profile"
                                    fill
                                    sizes="40px"
                                    className="object-cover rounded-full"
                                    onError={() => setImageError(true)}
                                />
                            </div>
                        ) : (
                            // Fallback to user icon
                            <User size={25} className="text-gray-600" />
                        )}
                    </Link>

                    <div className="flex items-center bg-white shadow-md px-4 py-2 rounded-full">
                        <span className="text-sm font-poppins-regular">Welcome Back, <span className="font-poppins-bold text-[#88C34E] text-[17px] ">{userName}</span></span>
                    </div>
                </div>
            </div>
        </header>
    );
};

type LinkItemProps = {
    href: string;
    icon: React.ReactNode;
    label: string;
};

const LinkItem = ({ href, icon, label }: LinkItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`
        flex items-center relative p-2 pt-[13px] pb-[13px] rounded-full rounded-tr-none
        ${isActive
                ? "text-white bg-[#88C34E]"
                : "text-gray-700 hover:text-[#88C34E] hover:bg-green-50"}
        transition-all duration-200
      `}
        >
            <div className="flex items-center space-x-3 ml-2">
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </div>
        </Link>
    );
};

type DropdownItemProps = {
    icon: React.ReactNode;
    label: string;
    isHovered: boolean;
    isActive: boolean;
};

const DropdownItem = ({ icon, label, isHovered, isActive }: DropdownItemProps) => {
    return (
        <div
            className={`
        flex items-center justify-between relative p-2 pt-[13px] pb-[13px] rounded-full rounded-tr-none cursor-pointer
        ${isActive
                ? "text-white bg-[#88C34E]"
                : isHovered
                    ? "text-[#88C34E] bg-green-50"
                    : "text-gray-700 hover:text-[#88C34E] hover:bg-green-50"}
        transition-all duration-200
      `}
        >
            <div className="flex items-center space-x-3 ml-2">
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </div>
            <ChevronDown
                size={16}
                className={`mr-2 transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`}
            />
        </div>
    );
};

type DropdownLinkProps = {
    href: string;
    label: string;
};

const DropdownLink = ({ href, label }: DropdownLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`
        block px-6 py-2 text-sm transition-colors duration-200 rounded-lg mx-2 my-1
        ${isActive
                ? "text-white bg-[#88C34E] font-medium"
                : "text-gray-700 hover:text-[#88C34E] hover:bg-green-50"}
      `}
        >
            {label}
        </Link>
    );
};

export default Dashboard;