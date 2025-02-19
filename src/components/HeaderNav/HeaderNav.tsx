'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import AGRIMART from "../../../public/Images/HeaderNav/AGRIMART.png";

// import ScheduleDrawer from '@/components/Common/ScheduleDrawer';
// import PlayersDrawer from '@/components/Common/PlayersDrawer';
// import RankingsDrawer from '@/components/Common/RankingsDrawer';
// import PlayingExperiencesDrawer from '@/components/Common/PlayingExperiencesDrawer';

type NavItem = "SCHEDULE" | "PLAYERS" | "RANKINGS" | "PLAYING EXPERIENCES" | "TICKETS" | "JOIN" | "ABOUT US" | "NEWS";

// function getDropdownContent(item: NavItem) {
//     switch (item) {
//         case "SCHEDULE":
//             return <ScheduleDrawer />;
//         case "PLAYERS":
//             return <PlayersDrawer />;
//         case "RANKINGS":
//             return <RankingsDrawer />;
//         case "PLAYING EXPERIENCES":
//             return <PlayingExperiencesDrawer />;
//         default:
//             return null;
//     }
// }

export default function HeaderNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeNavItem, setActiveNavItem] = useState<NavItem | null>(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };


    const router = useRouter();

    const handleNavigationSignUp = () => {
        router.push('/signup-page');
    };

    const handleNavigationSignIn = () => {
        router.push('/signin-page');
    };


    const handleNavItemClick = (item: NavItem) => {
        setActiveNavItem(item);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
            <header
                className={`lg:h-[117px] md:h-[117px] sticky top-0 z-50 bg-white border-b border-gray-200 py-4 ${scrolled ? "lg:hidden" : "block"
                }`}
            >
                <div className="xl:max-w-7xl lg:max-w-5xl mx-auto font-Poppins  px-4 sm:px-6 lg:px-8 flex items-center justify-between ">
                    <div className="flex items-center space-x-4 xl:w-[152px] lg:w-[140px] lg:h-[8px] mt-[10px] mb-[5px] ">
                        <Image
                            src={AGRIMART}
                            className=" w-24 sm:w-36  xl:w-44"
                            alt="Logo"
                            width={150}
                            height={50}
                        />
                        <div>
                            <hr className="bg-[#afb7cb] mt-[8px] h-[60px] w-[2px] mr-[5px]" />
                        </div>

                        <div>
                            <div>
                                {/*<p className="text-[10px] text-[#afb7cb] font-poppins-light whitespace-nowrap mt-[20px]">*/}
                                {/*    PRESENTED BY*/}
                                {/*</p>*/}

                            </div>
                            {/*<img*/}
                            {/*    src="https://www.legendstour.com/assets/images/product_logo.svg"*/}
                            {/*    alt="Product Logo"*/}
                            {/*    className="xl:mr-[250px] lg:mr-[100px]"*/}
                            {/*    width={100}*/}
                            {/*    height={50}*/}
                            {/*/>*/}
                        </div>
                    </div>


                    <div className="hidden lg:flex items-center space-x-6 ">
                        <div className="text-center md:text-left">
                            <p className="tracking-wider text-[#5C8F2B] text-[10px] font-poppins-light  mb-0 leading-none">
                                CALL OUR CONCIERGE
                            </p>
                            <p className="text-[#5C8F2B] text-3xl mt-0 font-poppins-regular leading-none">
                                071 000 00 00
                            </p>
                        </div>

                        <button className="bg-[#5C8F2B] shadow-md shadow-gray-400 focus:shadow-lg rounded-tr-none rounded-3xl tracking-wider text-white text-lg font-poppins-regular px-[27px] py-[12px] mt-[3px] ">
                            CONTACT
                        </button>

                        {/*<iframe*/}
                        {/*    src="https://static.rolex.com/clocks/2020/legendstour_desktop_HTML_180x75/rolex.html#Your_Time"*/}
                        {/*    width="180"*/}
                        {/*    height="75"*/}
                        {/*    className="border-none mt-[5px]"*/}
                        {/*    title="Rolex Clock"*/}
                        {/*></iframe>*/}
                        <iframe
                            scrolling="no"
                            frameBorder="0"
                            // clocktype="html5"
                            style={{
                                overflow: "hidden",
                                width:"190px",
                                height: "75px",
                            }}
                            src="https://www.clocklink.com/html5embed.php?clock=008&timezone=GMT0530&color=black&size=190&Title=&Message=&Target=&From=2024,1,1,0,0,0&Color=black"
                            title="Clock Widget"
                        />


                    </div>
                    <div className="lg:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded={isOpen ? "true" : "false"}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <nav className={`bg-[#5C8F2B] lg:border-[2px]   border-black-200 ${scrolled ? '' : 'relative'}`}>
                <div className="xl:max-w-7xl lg:max-w-5xl mx-auto sm:px-6  ">
                    <div className="relative flex items-center justify-between lg:h-16">
                        <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-center">
                            <div className="hidden lg:block w-full ">
                                <div className="flex items-center text-white font-poppins space-x-[260px]">
                                    <div className="flex items-center space-x-[50px] ">
                                    {[
                                        "Home",
                                        "About Us",
                                        "Terms and Conditions",
                                        "Privacy Policy",
                                    ].map((item) => (
                                        <div
                                            key={item}

                                            className="relative"
                                        >
                                            <Link
                                                key={item}
                                                href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                                                className={`font-poppins-regular hover:text-[#5C8F2B] hover:bg-white hover:radius-[20px] tracking-[2px] pl-[15px] pr-[15px] text-[15px] text-center leading-none py-2   whitespace-pre-wrap ${activeNavItem === item ? 'pb-[20px] border-b-[5.5px] border-white' : ''}`}
                                                onClick={() => handleNavItemClick(item as NavItem)}
                                            >
                                                {item === "PLAYING EXPERIENCES" ? (
                                                    <span className="inline-block text-center leading-none">
                            PLAYING

                            EXPERIENCES
                          </span>
                                                ) : (
                                                    item
                                                )}
                                            </Link>

                                            {/*{activeDropdown === item && (*/}
                                            {/*    <div*/}
                                            {/*        className="absolute top-full right-0 mt-2"*/}
                                            {/*        onMouseEnter={handleDrawerMouseEnter}*/}
                                            {/*        onMouseLeave={handleDrawerMouseLeave}*/}
                                            {/*    >*/}
                                            {/*        {getDropdownContent(item as NavItem)}*/}
                                            {/*    </div>*/}
                                            {/*)}*/}
                                        </div>
                                    ))}
                                    </div>
                                    <div className="hidden lg:flex items-center justify-center space-x-6">
                                        <button className="bg-white  shadow-md shadow-gray-600  rounded-tr-none rounded-3xl tracking-wider text-[#5C8F2B] lg:text-[12px] xl:text-[13px] font-poppins-regular  px-[15px] py-[10px] mt-[3px] w-[100px]"
                                                onClick={handleNavigationSignIn}>

                                            Login
                                        </button>

                                        <button className="border-white border-[3px]  bg-[#5C8F2B] shadow-md shadow-gray-600  rounded-tr-none rounded-3xl tracking-wider text-white lg:text-[12px] xl:text-[13px] font-poppins-regular  px-[15px] py-[8px] mt-[3px] w-[100px] "
                                                onClick={handleNavigationSignUp}>
                                            SignUp
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isOpen && (
                    <div className="lg:hidden"  id="mobile-menu">
                        <div className="px-2 pt-[30px] pb-3 space-y-1 bg-white font-brown-bold text-[12px] ">
                            {[
                                "Home",
                                "About Us",
                                "Terms and Conditions",
                                "Privacy Policy",
                            ].map((item) => (
                                <Link
                                    key={item}
                                    href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="text-custom-600 border-b-2 p-[24px] border-gray-300 hover:text-hoverCustom-600 block px-3 py-2 text-[14px]  "
                                    onClick={() => handleNavItemClick(item as NavItem)}
                                >
                                    {item}
                                </Link>
                            ))}
                            <div className="hidden lg:flex items-center space-x-6 xl:ml-[200px] ">
                                <button className="bg-white shadow-md shadow-gray-400  rounded-tr-none rounded-3xltracking-wider text-white lg:text-[12px] xl:text-[13px] font-bold px-[15px] py-[10px] mt-[3px] ">
                                    CONTACT
                                </button>

                                <button className="bg-white shadow-md shadow-gray-400  rounded-tr-none rounded-3xltracking-wider text-white lg:text-[12px] xl:text-[13px] font-bold px-[15px] py-[10px] mt-[3px] ">
                                    CONTACT
                                </button>

                            </div>
                        </div>
                    </div>
                )}
            </nav>
            <nav className={`bg-white lg:border-[2px]   border-black-200 ${scrolled ? 'fixed top-0  left-0 w-full z-10' : 'hidden'}`}>
                <div className="xl:max-w-7xl lg:max-w-5xl mx-auto sm:px-6  ">
                    <div className="relative flex items-center justify-between lg:h-16">
                        <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-center">
                            <div className="hidden lg:block w-full ">

                                <div className="flex  text-[#522367] ">
                                    <div className="flex items-center space-x-4 xl:w-[82px] lg:w-[60px] lg:h-[8px] mt-[10px] mb-[5px] ">
                                        <Image
                                            src={AGRIMART}
                                            className=" w-24 sm:w-36  xl:w-44"
                                            alt="Logo"
                                            width={150}
                                            height={50}
                                        />
                                    </div>

                                    {[
                                        "Home",
                                        "About Us",
                                        "Terms and Conditions",
                                        "Privacy Policy",

                                    ].map((item) => (
                                        <div
                                            key={item}

                                            className="relative"
                                        >
                                            <Link
                                                key={item}
                                                href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                                                className={`font-sans font-bold tracking-[2px] pl-[15px] pr-[15px] text-[12px] text-center leading-none py-2   whitespace-pre-wrap ${activeNavItem === item ? 'pb-[28px] border-b-[5.5px] border-custom-800' : ''}`}
                                                onClick={() => handleNavItemClick(item as NavItem)}
                                            >
                                                {item === "PLAYING EXPERIENCES" ? (
                                                    <span className="inline-block text-center leading-none">
                            PLAYING

                            EXPERIENCES
                          </span>
                                                ) : (
                                                    item
                                                )}
                                            </Link>

                                            {/*{activeDropdown === item && (*/}
                                            {/*    <div*/}
                                            {/*        className="absolute top-full right-0 mt-2"*/}
                                            {/*        onMouseEnter={handleDrawerMouseEnter}*/}
                                            {/*        onMouseLeave={handleDrawerMouseLeave}*/}
                                            {/*    >*/}
                                            {/*        {getDropdownContent(item as NavItem)}*/}
                                            {/*    </div>*/}
                                            {/*)}*/}
                                        </div>
                                    ))}
                                    <div className="hidden bg-transparent lg:flex items-center space-x-6 xl:ml-[200px] ">
                                        <div className="text-center md:text-left">
                                            <p className="tracking-wider text-custom-800 text-[10px] font-bold mb-0 leading-none">
                                                CALL OUR CONCIERGE
                                            </p>
                                            <p className="text-custom lg:text-[16px] xl:text-[21px] mt-0 font-brown-light leading-none">
                                                071 000 00 00
                                            </p>
                                        </div>

                                        <button className="bg-[#5C8F2B] shadow-md shadow-gray-400  rounded-tr-none rounded-3xltracking-wider text-white lg:text-[12px] xl:text-[13px] font-bold px-[15px] py-[10px] mt-[3px] ">
                                            CONTACT
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isOpen && (
                    <div className="lg:hidden"  id="mobile-menu">
                        <div className="px-2 pt-[30px] pb-3 space-y-1 bg-white font-brown-bold text-[12px] ">
                            {[
                                "SCHEDULE",
                                "PLAYERS",
                                "RANKINGS",
                                "PLAYING EXPERIENCES",
                                "TICKETS",
                                "JOIN",
                                "ABOUT US",
                                "NEWS",
                            ].map((item) => (
                                <Link
                                    key={item}
                                    href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="text-custom-600 border-b-2 p-[24px] border-gray-300 hover:text-hoverCustom-600 block px-3 py-2 text-[14px]  "
                                    onClick={() => handleNavItemClick(item as NavItem)}
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
