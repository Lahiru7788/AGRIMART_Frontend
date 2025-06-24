"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const DashboardCard = ({ title, imageSrc, targetPath, buttonText }) => {
    return (
        <div className="w-[500px] mt-[30px]">
            <Link href={targetPath} passHref className="block w-full">
                <div className="bg-white shadow-md rounded-[20px] height-[500px] p-6 w-full h-full cursor-pointer transition-all hover:shadow-lg hover:shadow-[#88C34E] transform hover:-translate-y-1">
                    <div className="flex flex-col items-center">
                        {/* Image container with fixed height */}
                        <div className="w-full h-64 relative mb-4 rounded-lg overflow-hidden">
                            <Image
                                src={imageSrc}
                                alt={title}
                                fill
                                className="rounded-lg object-cover"
                                priority
                            />
                        </div>

                        {/* Card title */}
                        <h3 className="text-xl font-poppins-bold text-center text-gray-800 mt-4 min-h-[60px]">
                            {title}
                        </h3>

                        {/* Call to action button */}
                        <button className="mt-6 bg-[#88C34E] hover:bg-[#7AB33D] text-white font-poppins-bold py-3 px-6 rounded-full transition-colors w-full">
                            {buttonText}
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
};

const FarmerDashboardCards = () => {
    const cardData = [
        {
            title: "Seeds and Fertilizer Products",
            imageSrc: "/Images/HeaderNav/sfproduct.jpg",
            buttonText:"View Products",
            targetPath: "/farmerViewSFProducts"
        },
        {
            title: "Training Services For Farming",
            imageSrc:  "/Images/HeaderNav/best-agriculture-courses.jpg",
            buttonText:"View Services",
            targetPath: "/farmerViewTrainerCoursesAndServices"
        },
        // {
        //     title: "Training Services For Farming",
        //     imageSrc: "/images/training-services.jpg",
        //     buttonText:"View Services",
        //     targetPath: "/farmer/training-services"
        // }
    ];

    return (
        <div className="pt-[100px] p-6 bg-gray-100 min-h-screen">

            <div className="flex flex-wrap justify-center gap-8">
                {cardData.map((card, index) => (
                    <DashboardCard
                        key={index}
                        title={card.title}
                        imageSrc={card.imageSrc}
                        targetPath={card.targetPath}
                        buttonText={card.buttonText}
                    />
                ))}
            </div>
        </div>
    );
};

export default FarmerDashboardCards;