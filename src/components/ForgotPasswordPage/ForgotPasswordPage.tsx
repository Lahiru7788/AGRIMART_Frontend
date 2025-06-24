"use client"

import React, {useState, useEffect} from "react";
import axios from 'axios';
import Image from "next/image";
import Link from "next/link";
import BackgroundImage from "../../../public/Images/SignUpPage/SignInBackgroundImage.png";
import AGRIMART from "../../../public/Images/HeaderNav/AGRIMART.png";
import FruitImage from "../../../public/Images/SignUpPage/SignInFruitImage.png";
import User from "../../../public/Images/SignUpPage/User.png";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";

const ForgotPasswordPage: React.FC = () => {
    const [formData, setFormData] = useState({
        userEmail: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showWelcomePopup, setShowWelcomePopup] = useState(true);

    const router = useRouter();

    // Show welcome popup when component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcomePopup(false);
        }, 10000); // Auto-hide after 5 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleNavigationHome = () => {
        router.push('/');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        if (!formData.userEmail) {
            toast.error('Please enter your email address.', {
                position: "top-right",
                autoClose: 5000,
            });
            setIsLoading(false);
            return;
        }

        const forgotPasswordData = {
            userEmail: formData.userEmail,
        }

        try {
            const response = await axios.post(
                "http://localhost:8081/api/user/forgot-password",
                forgotPasswordData,
                { withCredentials: true }
            );

            console.log('Forgot password response:', response.data);

            // Check if the request was successful
            if (response.data.status === "200" || response.status === 200) {
                // Reset form
                setFormData({
                    userEmail: "",
                });

                // Show success toast
                toast.success('A new password has been generated and sent to your email address. Please check your inbox!', {
                    position: "top-right",
                    autoClose: 8000,
                });

                // Redirect to login page after a short delay
                setTimeout(() => {
                    router.push('/signin-page');
                }, 3000);

            } else {
                // Handle unsuccessful request
                toast.error('Failed to generate new password: ' + (response.data.message || 'Unknown error'), {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } catch (error) {
            console.error('Error during forgot password:', error);

            if (error.response && error.response.status === 404) {
                toast.error('Email address not found. Please check your email and try again.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            } else {
                toast.error('Failed to generate new password. Please try again later.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const closeWelcomePopup = () => {
        setShowWelcomePopup(false);
    };

    return (
        <div>
            {/* Welcome Popup */}
            {showWelcomePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-[20px] p-8 max-w-md mx-4 shadow-2xl">
                        <div className="text-center">
                            <h2 className="text-2xl font-syne-bold text-[#5C8F2B] mb-4">
                                Password Recovery
                            </h2>
                            <div className="mb-4">
                                <svg className="w-16 h-16 mx-auto text-[#88C34E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-700 font-poppins-regular mb-6 leading-relaxed">
                                Enter your email address and we'll automatically generate a new password for you.
                                The new password will be sent directly to your email inbox.
                            </p>
                            <button
                                onClick={closeWelcomePopup}
                                className="bg-[#5C8F2B] hover:bg-[#88C34E] text-white font-poppins-regular px-6 py-2 rounded-[15px] transition duration-300"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-center min-h-screen bg-white">
                <Image
                    src={BackgroundImage}
                    alt="Fresh Fruits and Vegetables"
                    className="absolute w-full h-screen"
                />

                <div className="flex-1 relative bg-[#B3FDBB] overflow-hidden flex flex-col max-w-[750px] rounded-[20px] items-center justify-center">
                    <div className="relative flex bg-white shadow-lg ml-[250px] rounded-[20px] w-full max-w-[500px]">

                        <div className="flex-1 mt-8 pl-8 rounded-lg">
                            <div className="flex space-x-[50px]">
                                <button
                                    type="button"
                                    className="w-[120px] h-[45px] font-poppins-light text-[16px] mt-[-10px] shadow-md shadow-gray-500 bg-[#88C34E] text-white font-semibold py-2 rounded-[20px] rounded-br-none transition duration-300 hover:bg-[#B3FDBB] hover:text-[#5C8F2B]"
                                    onClick={handleNavigationHome}>
                                    <span className="text-shadow-lg">Home</span>
                                </button>
                                <h1 className="text-2xl mt-12 font-syne-bold text-center text-gray-800 mb-6">Forgot Password</h1>
                            </div>

                            <form className="w-[350px] ml-[42px]" onSubmit={handleSubmit}>
                                <div>
                                    <div className="mb-4 mt-8 relative">
                                        <label className="block ml-[18px] text-gray-700 font-poppins-regular mb-1">
                                            Enter Your Email Address
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                                                <Image
                                                    src={User}
                                                    alt="User"
                                                    className="w-[80px] h-[18px] absolute"
                                                />
                                            </span>
                                            <input
                                                type="email"
                                                name="userEmail"
                                                value={formData.userEmail || ''}
                                                onChange={handleChange}
                                                placeholder="Enter your registered email"
                                                className="w-full border font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] pl-[42px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6 p-4 bg-[#f0f9ff] border border-[#88C34E] rounded-[15px]">
                                        <div className="flex items-start space-x-2">
                                            <svg className="w-5 h-5 text-[#5C8F2B] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm text-gray-600 font-poppins-regular">
                                                A new password will be automatically generated and sent to your email address. Please check your inbox after clicking the button below.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-[45px] font-poppins-light text-[16px] mt-4 shadow-md shadow-gray-500 bg-[#5C8F2B] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="text-shadow-lg">
                                            {isLoading ? 'Generating Password...' : 'Generate New Password'}
                                        </span>
                                    </button>
                                </div>
                            </form>

                            {/* Footer */}
                            <p className="text-center font-poppins-regular text-gray-700 mt-6 mb-16">
                                Remember your password?
                                {" "}
                                <Link href="/signin-page" className="text-[#5C8F2B] font-poppins-regular hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </div>

                        <div className="top-4 left-[-245px] absolute">
                            <Image
                                src={AGRIMART}
                                alt="AGRIMART Logo"
                                className="w-[250px] h-[250px]"
                            />
                        </div>

                        {/* Image */}
                        <div className="absolute bottom-[-60px] left-[-370px]">
                            <Image
                                src={FruitImage}
                                alt="Fruits"
                                className="w-[540px] h-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;