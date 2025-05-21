"use client"

import React from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// This is a custom hook that can be used across your application
export const useLogout = () => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // Get user credentials from session storage
            const emailItem = sessionStorage.getItem('userEmail');
            let userEmail = "";

            if (emailItem) {
                try {
                    const parsedItem = JSON.parse(emailItem);
                    userEmail = parsedItem.value || "";
                } catch (e) {
                    console.error("Error parsing user email from session storage:", e);
                }
            }

            // Make API call to logout
            const response = await axios.post(
                "http://localhost:8081/api/user/logout",
                { userEmail },
                { withCredentials: true }
            );

            // Check if logout was successful
            if (response.data && response.data.status === "200") {
                // Clear all session storage items
                sessionStorage.clear();

                // Show success toast
                toast.success('You have been successfully logged out!', {
                    position: "top-right",
                    autoClose: 3000,
                });

                // Redirect to login page
                router.push('/signin-page');
            } else {
                // Handle unsuccessful logout
                toast.error('Logout failed: ' + (response.data?.message || 'Unknown error'), {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } catch (error) {
            console.error('Error during logout:', error);

            // Even if the API call fails, clear session storage and redirect
            sessionStorage.clear();

            toast.warning('Logged out locally. Server logout may have failed.', {
                position: "top-right",
                autoClose: 5000,
            });

            router.push('/signin-page');
        }
    };

    return { handleLogout };
};