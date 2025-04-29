"use client"; // This file runs on the client side

import localFont from "next/font/local";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import Sidebar from "../components/FarmerDashboard/FarmerDashboard";
import React from "react";
import { usePathname } from "next/navigation";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});
const poppins = localFont({
    src: [
        { path: "./fonts/Poppins-Thin.ttf", weight: "100" },
        { path: "./fonts/Poppins-Light.ttf", weight: "300" },
        { path: "./fonts/Poppins-Regular.ttf", weight: "400" },
        { path: "./fonts/Poppins-Medium.ttf", weight: "500" },
        { path: "./fonts/Poppins-SemiBold.ttf", weight: "600" },
        { path: "./fonts/Poppins-Bold.ttf", weight: "700" },
        { path: "./fonts/Poppins-ExtraBold.ttf", weight: "800" },
        { path: "./fonts/Poppins-Black.ttf", weight: "900" },
    ],
    variable: "--font-poppins",
});

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();

    // Define pages where Sidebar should NOT be displayed
    const noSidebarRoutes = ["/", "/signup-page", "/signin-page", "/farmerDashboard", "/consumerDashboard", "/supermarketDashboard", "/seeds&FertilizerSellerDashboard", "/consumerAddOrder"];


    return (
        <html lang="en">
        <head>
            <link
                href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap"
                rel="stylesheet"
            />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}>
        <div className="flex h-screen">
            {/* Show Sidebar only if pathname is NOT in noSidebarRoutes */}
            {!noSidebarRoutes.includes(pathname) && <Sidebar />}
            {/*{!noSidebarRoutes.includes(pathname) && <TopNavBar />}*/}



            {/* Main Content Area */}
            <main className={`${noSidebarRoutes.includes(pathname) ? "w-full" : "ml-64 flex-1"} bg-gray-100`}>

                {children}
            </main>
        </div>

        {/* Toast Notifications */}
        <ToastContainer theme="light" />
        </body>
        </html>
    );
}
