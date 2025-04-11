import Image from "next/image";
import React from "react";
import Cart from "../../../public/Images/HeaderNav/icons8-cart-50.png"
import Logout from "../../../public/Images/HeaderNav/icons8-logout-50.png"
import Notifications from "../../../public/Images/HeaderNav/icons8-notifications-64.png"
import Seed from "../../../public/Images/HeaderNav/icons8-fertilizer-64 (1).png"

const Topbar = () => {
    return (
        <header className=" ml-[270px] fixed top-0 left-0 w-full bg-gray-100 flex items-center justify-between pl-4 pr-6 py-2 z-50">
            {/* Left Section */}
            <div className="flex items-center space-x-">
                <div className="p-2 bg-white shadow-md rounded-full border-[3px] border-[#88C34E]">
                    <Image src={Seed} alt="Agrimart Logo" width={40} height={40} />
                </div>
                <div>
                    <h2 className="text-lg font-poppins-bold ml-[20px]">Seeds and Fertilizer seller Dashboard</h2>
                    <p className="text-gray-500 font-poppins-regular ml-[20px]">See all your marketing features in here</p>
                </div>
            </div>

            {/* Right Section */}
            <div className="mr-[250px]">
                <div className="flex items-center space-x-4">
                    <button className="p-2 bg-white shadow-md rounded-full hover:invert">
                        <Image src = {Cart}  alt="Profile" width={25} height={25} />
                    </button>
                    <button className="p-2 bg-white shadow-md rounded-full hover:invert">
                        <Image src = {Logout}  alt="Profile" width={25} height={25} />
                    </button>
                    <button className="p-[3px] bg-white shadow-md rounded-full hover:invert">
                        <Image src = {Notifications}  alt="Profile" width={35} height={35} />
                    </button>
                    <div className="flex items-center bg-white shadow-md px-4 py-2 rounded-full">
                        <Image  alt="Profile" width={30} height={30} className="rounded-full" />
                        <span className="ml-2 text-sm">Welcome Back, <b>Lahiru Sampath</b></span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
