"use client";
import React from 'react'
import Image from 'next/image';
import LandingImage from "../../../public/Images/LandingPage/LandingImage.png";

const FreshFoodsBanner = () => {
    return (
        <section className=" ">
            <div className=" pt-12 h-[600px] bg-[#EAFFEC]">
            <div className=" mx-auto flex  items-center">
                {/* Text Section */}
                <div className="lg:w-1/2 mt-[-110px] text-center lg:text-left px-6 flex items-center justify-center ">
                    <div className="xl:mr-[-170px]">
                    <h1 className="text-[50px] font-coiny text-black leading-[50px]">
                        Your <span className="text-[#5C8F2B]">Gateway <br />
                        To</span>  <span className="text-black"><span className="text-[#88C34E]">Fresh </span><br/> Foods</span>
                    </h1>
                    <p className="text-gray-700 mt-4 xl:max-w-[500px] font-coiny text-[24px] leading-[30px]">
                        At AGRIMART, we&#39;re dedicated to producing the most fresh vegetables and fruits for you.
                    </p>
                    <button className="mt-6 px-6 py-3 bg-[#88C34E] text-[22px] text-white rounded-full font-coiny bg-[#5C8F2B] hover:bg-[#B3FDBB] shadow-md shadow-gray-500 rounded-bl-none rounded-3xl hover:text-[#5C8F2B]">
                        Learn More
                    </button>
                </div>
                </div>
                {/* Image Section */}
                <div className=" lg:mt-[30px] overflow-hidden flex items-center justify-center ml-[40px] ">
                    <div className="absolute rounded-[60px] rounded-tr-none w-[404px] h-[574px] bg-[#88C34E] xl:ml-[330px] p-4">

                    </div>
                    <Image

                        src= {LandingImage}// Replace this with the actual path to your image
                        alt="Fresh Fruits and Vegetables"
                        className=" mt-[85px] relative  w-[1200px]"
                    />
                </div>
            </div>
            </div>
        </section>
    );
};

export default FreshFoodsBanner;
