"use client"

import React, {useState} from "react";
import axios from 'axios';
import Image from "next/image";
import Link from "next/link";
import BackgroundImage from "../../../public/Images/SignUpPage/SignInBackgroundImage.png";
import AGRIMART from "../../../public/Images/HeaderNav/AGRIMART.png";
import FruitImage from "../../../public/Images/SignUpPage/SignInFruitImage.png";
import User from "../../../public/Images/SignUpPage/User.png";
import Password from "../../../public/Images/SignUpPage/Password.png";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState({
        userEmail: "",
        userPassword: "",
    });

    const router = useRouter();

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

    // Helper function to store user data with expiration
    const storeWithExpiry = (key, value, ttl) => {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + ttl,
        };
        sessionStorage.setItem(key, JSON.stringify(item));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const UserCredentialData = {
            userEmail: formData.userEmail,
            userPassword: formData.userPassword,
        }

        try {
            const credentialResponse = await axios.post(
                "http://localhost:8081/api/user/login",
                UserCredentialData,
                { withCredentials: true }
            );

            console.log('Data saved:', credentialResponse.data);

            // Check if the login was successful
            if (credentialResponse.data.status === "200" && credentialResponse.data.message === "Login Success") {
                // Extract the user data from the response
                const userData = credentialResponse.data.credentialDtoList[0]?.user;
                const userType = userData?.userType;
                const userID = userData?.userID;
                const userName = `${userData?.firstName} ${userData?.lastName}`;

                // Set expiration time to 24 hours (in milliseconds)
                const expiryTime = 24 * 60 * 60 * 1000;

                // Store user information in sessionStorage with expiration
                storeWithExpiry('userType', userType, expiryTime);
                storeWithExpiry('userEmail', formData.userEmail, expiryTime);
                storeWithExpiry('userName', userName, expiryTime);
                storeWithExpiry('userID', userID, expiryTime);

                // Also store login timestamp for reference
                storeWithExpiry('loginTimestamp', new Date().toISOString(), expiryTime);

                // Reset form
                setFormData({
                    userEmail: "",
                    userPassword: ""
                });

                // Show success toast
                toast.success('You have successfully logged in to the platform!', {
                    position: "top-right",
                    autoClose: 5000,
                });

                // Redirect based on user type
                if (userType === "Farmer") {
                    router.push('/farmerDashboard');
                } else if (userType === "Consumer") {
                    router.push('/consumerDashboard');
                } else if (userType === "Supermarket") {
                    router.push('/supermarketDashboard');
                } else if (userType === "SeedsAndFertilizerSeller") {
                    router.push('/seeds&FertilizerSellerDashboard');
                } else if (userType === "FarmerTrainer") {
                    router.push('/trainerDashboard');
                } else {
                    // Default dashboard or handle unknown user type
                    router.push('/dashboard');
                }
            } else {
                // Handle unsuccessful login
                toast.error('Login failed: ' + (credentialResponse.data.message || 'Unknown error'), {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } catch (error) {
            console.error('Error during login:', error);
            toast.error('Login failed. Please check your credentials and try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    return (
        <div>
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
                                <h1 className="text-3xl mt-12 font-syne-bold text-center text-gray-800 mb-6">SignIn</h1>
                            </div>

                            <form className="w-[350px] ml-[42px]" onSubmit={handleSubmit}>
                                <div>
                                    <div className="mb-4 mt-8 relative">
                                        <label className="block ml-[18px] text-gray-700 font-poppins-regular mb-1">
                                            User Email
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
                                                placeholder="Enter your email"
                                                className="w-full border font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] pl-[42px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block ml-[18px] text-gray-700 font-poppins-regular mb-1">User Password</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                                                <Image
                                                    src={Password}
                                                    alt="Password"
                                                    className="w-[80px] h-[18px] absolute"
                                                />
                                            </span>
                                            <input
                                                type="password"
                                                name="userPassword"
                                                value={formData.userPassword || ''}
                                                onChange={handleChange}
                                                placeholder="Enter your password"
                                                className="w-full border font-poppins-regular pl-[42px] shadow-md shadow-gray-200 rounded-[20px] px-4 py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
                                            />
                                        </div>
                                        {/* Forgot Password Link */}
                                        <div className="flex justify-end mt-2">
                                            <Link
                                                href="/forgotPassword-page"
                                                className="text-[#5C8F2B] font-poppins-regular text-sm hover:underline transition-colors duration-200"
                                            >
                                                Forgot Password?
                                            </Link>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full h-[45px] font-poppins-light text-[16px] mt-8 shadow-md shadow-gray-500 bg-[#5C8F2B] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300"
                                    >
                                        <span className="text-shadow-lg">SignIn</span>
                                    </button>
                                </div>
                            </form>

                            {/* Footer */}
                            <p className="text-center font-poppins-regular text-gray-700 mt-4 mb-16">
                                Don&#39;t have an account?
                                {" "}
                                <Link href="/signup-page" className="text-[#5C8F2B] font-poppins-regular hover:underline">
                                    Sign Up
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

export default LoginPage;