"use client"; // This file runs on the client side

import localFont from "next/font/local";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Import all sidebar components
import FarmerSidebar from "../components/FarmerDashboard/FarmerDashboard";
import ConsumerSidebar from "../components/ConsumerDashboard/ConsumerDashboard";
import SupermarketSidebar from "../components/SupermarketDashboard/SupermarketDashboard";
import SeedsFertilizerSellerSidebar from "../components/SAndFSellerDashboard/SAndFSellerDashboard";
import FarmerTrainerSidebar from "../components/SAndFSellerDashboard/SAndFSellerDashboard";
// import AdminSidebar from "../components/AdminDashboard/AdminSidebar";

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
    const [currentDashboard, setCurrentDashboard] = useState<string | null>(null);

    // Define routes where no sidebar should be displayed
    const noSidebarRoutes = ["/", "/signup-page", "/signin-page", "/farmerDashboard", "/consumerDashboard", "/supermarketDashboard", "/seeds&FertilizerSellerDashboard", "/adminDashboard"];

    // Detect dashboard type based on pathname and store in state
    useEffect(() => {
        // If we're on a no-sidebar route, clear the current dashboard
        if (noSidebarRoutes.includes(pathname)) {
            setCurrentDashboard(null);
            return;
        }

        // Set current dashboard type
        if (pathname.includes('/farmer')) {
            setCurrentDashboard('farmer');
        } else if (pathname.includes('/consumer')) {
            setCurrentDashboard('consumer');
        } else if (pathname.includes('/supermarket')) {
            setCurrentDashboard('supermarket');
        } else if (pathname.includes('/seedsSeller')) {
            setCurrentDashboard('seedsSeller');
        } else if (pathname.includes('/farmerTrainer')) {
            setCurrentDashboard('farmerTrainer');
        }

        // Handle dashboard selection pages - these should set the dashboard type
        // but not display the sidebar
        if (pathname === '/farmerDashboard') {
            localStorage.setItem('dashboardType', 'farmer');
        } else if (pathname === '/consumerDashboard') {
            localStorage.setItem('dashboardType', 'consumer');
        } else if (pathname === '/supermarketDashboard') {
            localStorage.setItem('dashboardType', 'supermarket');
        } else if (pathname === '/seeds&FertilizerSellerDashboard') {
            localStorage.setItem('dashboardType', 'seedsSeller');
        } else if (pathname === '/farmerTrainerDashboard') {
            localStorage.setItem('dashboardType', 'farmerTrainer');
        }

        // If we can't detect the dashboard type from the URL, use the stored value
        if (!currentDashboard && !noSidebarRoutes.includes(pathname)) {
            const storedDashboard = localStorage.getItem('dashboardType');
            if (storedDashboard) {
                setCurrentDashboard(storedDashboard);
            }
        }
    }, [pathname, currentDashboard]);

    // Determine which sidebar to show based on the current dashboard
    const renderSidebar = () => {
        // No sidebar on specified routes
        if (noSidebarRoutes.includes(pathname)) {
            return null;
        }

        // Render appropriate sidebar based on detected dashboard type
        switch (currentDashboard) {
            case 'farmer':
                return <FarmerSidebar />;
            case 'consumer':
                return <ConsumerSidebar />;
            case 'supermarket':
                return <SupermarketSidebar />;
            case 'seedsSeller':
                return <SeedsFertilizerSellerSidebar />;
            // case 'admin':
            //     return <AdminSidebar />;
            default:
                return null;
        }
    };

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
            {/* Dynamic sidebar rendering */}
            {renderSidebar()}

            {/* Main Content Area */}
            <main className={`${noSidebarRoutes.includes(pathname) || !currentDashboard ? "w-full" : "ml-64 flex-1"} bg-gray-100`}>
                {children}
            </main>
        </div>

        {/* Toast Notifications */}
        <ToastContainer theme="light" />
        </body>
        </html>
    );
}