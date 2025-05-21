"use client"

import React, {useState} from "react";

import axios from 'axios';
import Image from "next/image";
import Link from "next/link";
import BackgroundImage from "../../../public/Images/SignUpPage/SignUpBackgroundImage.png";
import AGRIMART from "../../../public/Images/HeaderNav/AGRIMART.png";
import FruitImage from "../../../public/Images/SignUpPage/SignUpFruitImage.png";
import User from "../../../public/Images/SignUpPage/User.png";
import Password from "../../../public/Images/SignUpPage/Password.png";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const SignupPage: React.FC = () => {

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        userEmail: "",
        userType: "",
        userPassword: "",

    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const router = useRouter();

    const handleNavigationSignIn = () => {
        router.push('/signin-page');
    };

    const handleNavigationHome = () => {
        router.push('/');
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) =>  {
        event.preventDefault();

        const UserData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            userEmail: formData.userEmail,
            userType: formData.userType,

        };
        console.log(UserData);

        const UserCredentialData = {
            userEmail: formData.userEmail,
            userPassword: formData.userPassword,
        }

        try {
            const response = await axios.post("http://localhost:8081/api/user/registration", UserData);
            console.log('Data saved:', response.data);

            const credentialResponse = await axios.post("http://localhost:8081/api/user/credentials", UserCredentialData);
            console.log('Data saved:', credentialResponse.data);

            setFormData({
                firstName: "",
                lastName: "",
                userType: "",
                userEmail:"",
                userPassword: ""

            });
            toast.success('You have successfully registered in the platform!', {
                position: "top-right",
                autoClose: 5000,
            });

        } catch (error) {
            console.error('Error saving data:', error);
        }
    };
    return (
        <div className="flex  items-center justify-center  min-h-screen bg-white">
            <Image

                src= {BackgroundImage}
                alt="Fresh Fruits and Vegetables"
                className=" absolute w-full h-screen"
            />



            <div className="flex-1 relative bg-[#B3FDBB] overflow-hidden flex flex-col max-w-[750px] rounded-[20px] items-center justify-center">
            <div className="relative flex bg-white shadow-lg  mr-[250px] rounded-[20px] w-full max-w-[500px]">


                <div className="flex-1 p-8 rounded-lg">
                    <div className="flex space-x-[50px]">
                    <button
                        type="submit"
                        className="w-[120px] h-[45px] font-poppins-light text-[16px] mt-[-10px] shadow-md shadow-gray-500 bg-[#88C34E]  text-white font-semibold py-2 rounded-[20px] rounded-br-none transition duration-300 hover:bg-[#B3FDBB] hover:text-[#5C8F2B]"
                        onClick={handleNavigationHome}>
                        <span className="text-shadow-lg">Home</span>
                    </button>
                    <h1 className="text-3xl font-syne-bold text-center text-gray-800 mb-6">SignUp</h1>
                    </div>


                    <form className="w-[350px] ml-[42px]" onSubmit={handleSubmit}>

                        <div>
                        <div className="flex gap-4 mb-4">
                            <div className="w-1/2">
                                <label className="block ml-[18px] text-gray-700 font-poppins-regular mb-1">First Name</label>
                                <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                                 <Image
                                     src={User}
                                     alt="Vegetables"
                                     className=" w-[80px] h-[18px] absolute"
                                 />
                                </span>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName || ''}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                    className="w-full border font-poppins-regular pl-[42px] shadow-md shadow-gray-200 rounded-[20px] px-4 py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
                                />
                                </div>
                            </div>

                            <div className="w-1/2">
                                <label className="block ml-[18px] text-gray-700 font-poppins-regular  mb-1">Last Name</label>
                                <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                                 <Image
                                     src={User}
                                     alt="Vegetables"
                                     className=" w-[80px] h-[18px] absolute"
                                 />
                                </span>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName || ''}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                    className="w-full font-poppins-regular pl-[42px] shadow-md shadow-gray-200 border rounded-[20px] px-4 py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
                                />
                            </div>
                        </div>
                        </div>


                            <div className="mb-4 relative">
                                <label className="block ml-[18px] text-gray-700 font-poppins-regular mb-1">
                                    User Email
                                </label>
                                <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                                 <Image
                                     src={User}
                                     alt="Vegetables"
                                     className=" w-[80px] h-[18px] absolute"
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
                            <label className="block ml-[18px] text-gray-700 font-poppins-regular  mb-1">User Password</label>
                                <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                                 <Image
                                     src={Password} // Replace with your image path
                                     alt="Password"
                                     className=" w-[80px] h-[18px] absolute"
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
                        </div>

                        {/* User Type */}
                        <div className="mb-6 ">
                            <label className="block text-gray-700 mb-1 ml-[18px] font-poppins-regular ">User Type</label>
                            <select className="w-full shadow-md font-poppins-regular  shadow-gray-200 border rounded-[20px] px-4 py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
                                    onChange={handleChange}
                                    name="userType"
                                    value={formData.userType || ''}>

                                <option value="#">Select your user type</option>
                                <option value="Farmer">Farmer</option>
                                <option value="SeedsAndFertilizerSeller">Seeds and Fertilizer Seller</option>
                                <option value="FarmerTrainer">Farmer Trainer</option>
                                <option value="Consumer">Consumer</option>
                                <option value="Supermarket">Supermarket</option>
                            </select>

                        </div>


                        <button
                            type="submit"
                            className="w-full h-[45px] font-poppins-light  text-[16px] shadow-md shadow-gray-500 bg-[#5C8F2B] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300"
                            onClick={handleNavigationSignIn}>
                            <span className="text-shadow-lg">SignUp</span>
                        </button>


                        </div>
                    </form>

                    {/* Footer */}
                    <p className="text-center font-poppins-regular text-gray-700 mt-4">
                        Already have an account?{" "}
                        <Link href="/signin-page" className="text-[#5C8F2B] font-poppins-regular  hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Right Section */}

                    <div className="  right-[-245px]">
                        <Image
                            src={AGRIMART} // Replace with your image path
                            alt="Vegetables"
                            className=" w-[250px] h-[250px] absolute"
                        />
                    </div>

                    {/* Image */}
               <div className="absolute top-[220px] right-[-450px]">
                    <Image
                        src={FruitImage} // Replace with your image path
                        alt="Vegetables"
                        className=" w-[730px] h-full  "
                    />
               </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
