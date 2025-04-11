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

    const handleNavigationDashboard= () => {
        router.push('/farmerDashboard');

    };

    const handleNavigationHome = () => {
        router.push('/');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>  {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) =>  {
        event.preventDefault();

        // const { firstName, lastName, userType } = formData;
        //
        //
        // if (!firstName || !lastName  || !userType ) {
        //     // Swal.fire({
        //     //     icon: 'error',
        //     //     title: 'Validation Error',
        //     //     text: 'First Name, Last Name, Employee Email, Employee Type, Employee Status, Password are required.',
        //     // });
        //     return;}


        const UserCredentialData = {
            userEmail: formData.userEmail,
            userPassword: formData.userPassword,
        }

        try {


            const credentialResponse = await axios.post("http://localhost:8081/api/user/login", UserCredentialData ,{ withCredentials: true } );
            console.log('Data saved:', credentialResponse.data);

            setFormData({
                userEmail:"",
                userPassword: ""

            });
            toast.success('You have successfully login to the platform!', {
                position: "top-right",
                autoClose: 5000,
            });



        } catch (error) {
            console.error('Error saving data:', error);
        }
    };
    return (
        <div>

        <div className="flex  items-center justify-center  min-h-screen bg-white">
            <Image

                src= {BackgroundImage}
                alt="Fresh Fruits and Vegetables"
                className=" absolute w-full h-screen"
            />

            <div className="flex-1 relative bg-[#B3FDBB] overflow-hidden flex flex-col max-w-[750px] rounded-[20px] items-center justify-center">
                <div className="relative flex bg-white shadow-lg  ml-[250px] rounded-[20px] w-full max-w-[500px]">

                    <div className="flex-1 mt-8 pl-8 rounded-lg">
                        <div className="flex space-x-[50px]">
                            <button
                                type="submit"
                                className="w-[120px] h-[45px] font-poppins-light text-[16px] mt-[-10px] shadow-md shadow-gray-500 bg-[#88C34E]  text-white font-semibold py-2 rounded-[20px] rounded-br-none transition duration-300 hover:bg-[#B3FDBB] hover:text-[#5C8F2B]"
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


                                <div className="mb-16">
                                    <label className="block ml-[18px] text-gray-700 font-poppins-regular  mb-1">User Password</label>
                                    <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                                 <Image
                                     src={Password}
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


                                <button
                                    type="submit"
                                    className="w-full h-[45px] font-poppins-light  text-[16px] shadow-md shadow-gray-500 bg-[#5C8F2B] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300"
                                    onClick={handleNavigationDashboard}>
                                    <span className="text-shadow-lg">SignIn</span>
                                </button>

                            </div>
                        </form>

                        {/* Footer */}
                        <p className="text-center font-poppins-regular text-gray-700 mt-4 mb-16">
                            Don&#39;t have an account?
                            {" "}
                            <Link href="/signup-page" className="text-[#5C8F2B] font-poppins-regular  hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    </div>



                    <div className=" top-4 left-[-245px] absolute  ">
                        <Image
                            src={AGRIMART}
                            alt="Vegetables"
                            className=" w-[250px] h-[250px] "
                        />
                    </div>

                    {/* Image */}
                    <div className="absolute  bottom-[-60px] left-[-370px]">
                        <Image
                            src={FruitImage}
                            alt="Vegetables"
                            className=" w-[540px] h-full  "
                        />
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default LoginPage;
