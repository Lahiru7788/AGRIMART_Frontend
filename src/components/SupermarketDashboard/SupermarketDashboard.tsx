"use client"

import Link from "next/link";
import { Home, PlusCircle, Package2, Eye, Users, LineChart, FileText, User } from "lucide-react";
import AGRIMART from "../../../public/Images/HeaderNav/AGRIMART.png";
import Cart from "../../../public/Images/HeaderNav/icons8-cart-50.png";
import Logout from "../../../public/Images/HeaderNav/icons8-logout-50.png";
import Notifications from "../../../public/Images/HeaderNav/icons8-notifications-64.png";
import Farmer from "../../../public/Images/HeaderNav/icons8-farmer-64.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useLogout } from "../Logout/Logout";

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
    return (
        <aside className="w-[260px] bg-white rounded-xl shadow-lg pb-4 pl-6 pr-8 flex flex-col justify-between fixed h-screen">
            {/* Logo Section */}
            <div>
                <div className="flex items-center justify-center mt-[-20px]">
                    <Image src={AGRIMART} alt="Agrimart Logo" className="w-48" />
                </div>
                <h2 className="text-gray-500 uppercase font-poppins-bold text-sm">Menu</h2>

                {/* Menu Items */}
                <nav className="mt-4 space-y-[2px] font-poppins-regular">
                    <LinkItem href="/" icon={<Home size={20} />} label="Home" />
                    <LinkItem href="/supermarketAddOrder" icon={<PlusCircle size={20} />} label="Add Orders" />
                    <LinkItem href="/supermarketUpdateOrder" icon={<Package2 size={20} />} label="Update Orders" />
                    <LinkItem href="/supermarketViewProducts" icon={<Eye size={20} />} label="View Product" />
                    <LinkItem href="/customers" icon={<Users size={20} />} label="Sellers" />
                    <LinkItem href="/sales" icon={<LineChart size={20} />} label="Purchase History" />
                    <LinkItem href="/reports" icon={<FileText size={20} />} label="Reports" />
                </nav>
            </div>

            {/* Bottom Button */}
            <div className="bg-[#88C34E] mt-[20px] font-poppins-regular rounded-full rounded-bl-none text-white text-center p-3 text-xs font-semibold">
                If you need to help to buy products your future needs,<br />
                <Link href="/help" className="font-coiny mt-[5px] text-[15px]">Click Here</Link>
            </div>
        </aside>
    );
};

const Topbar = () => {

    const { handleLogout } = useLogout(); // Use the logout hook
    const [userName, setUserName] = useState("User");

    useEffect(() => {
        // Get user name from session storage when component mounts
        const userNameItem = sessionStorage.getItem('userName');
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
    }, []);

    return (
        <header className="ml-[270px] fixed top-0 left-0 w-full bg-gray-100 flex items-center justify-between pl-4 pr-6 py-2 z-50">
            {/* Left Section */}
            <div className="flex items-center space-x-">
                <div className="p-2 bg-white shadow-md rounded-full border-[3px] border-[#88C34E]">
                    <Image src={Farmer} alt="Agrimart Logo" width={40} height={40} />
                </div>
                <div>
                    <h2 className="text-lg font-poppins-bold ml-[20px]">Supermarket Dashboard</h2>
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
                    <button className="p-[3px] bg-white shadow-md rounded-full hover:invert">
                        <Image src={Notifications} alt="Notifications" width={35} height={35} />
                    </button>
                    {/* Added Profile Icon Button */}
                    <Link href="/supermarketProfile" className="p-2 bg-white shadow-md rounded-full hover:invert">
                        <User size={25} className="text-gray-600" />
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
                : "text-gray-700 hover:text-green-500 hover:bg-green-50"}
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

export default Dashboard;