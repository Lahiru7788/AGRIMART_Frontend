'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import axios from "axios";
import {toast} from "react-toastify";
import Camera from "../../../../public/Images/HeaderNav/icons8-camera-50.png"
import Logout from "../../../../public/Images/HeaderNav/icons8-logout-50.png";

const FarmerDashboard: React.FC = () =>{
    const [image, setImage] = useState<string | null>(null);

    const [file, setFile] = useState<File | null>(null);

    const handleImageClick = () => {
        document.getElementById("fileInput")?.click();
    };


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);

            // Convert image to URL for preview
            const imageUrl = URL.createObjectURL(selectedFile);
            setImage(imageUrl);

            // Upload image to backend
            await uploadImage(selectedFile);
        }
    };

    const uploadImage = async (selectedFile: File) => {
        try {
            const formData = new FormData();
            formData.append("image", selectedFile);

            // Replace with your backend API endpoint
            const response = await axios.post("http://localhost:8081/api/user/farmerProductImage", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Upload success:", response.data);
        } catch (error) {
            console.error("Upload failed:", error);
        }
    }

    const [formData, setFormData] = useState({
        productName: "",
        productImage: "",
        price: "",
        availableQuantity: "",
        minimumQuantity: "",
        description: "",
        addedDate: "",
        productCategory: "",

    });

    const [offerFormData, setOfferFormData] = useState({
        offerName: "",
        newPrice: "",
        offerDescription: "",

    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setOfferFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) =>  {
        event.preventDefault();

        const ProductData = {
            productName: formData.productName,
            price: formData.price,
            availableQuantity: formData.availableQuantity,
            minimumQuantity: formData.minimumQuantity,
            description: formData.description,
            addedDate: formData.addedDate,
            productCategory: formData.productCategory,


        };
        console.log(ProductData);


        try {
            const response = await axios.post("http://localhost:8081/api/user/farmerProducts", ProductData);
            console.log('Data saved:', response.data);

            setFormData({
                productName: "",
                productImage: "",
                price: "",
                availableQuantity: "",
                minimumQuantity: "",
                description: "",
                addedDate: "",
                productCategory: "",


            });
            toast.success('You have successfully registered in the platform!', {
                position: "top-right",
                autoClose: 5000,
            });

        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    const handleSubmitOffer = async (event: React.FormEvent<HTMLFormElement>) =>  {
        event.preventDefault();

        const OfferData = {
            offerName: offerFormData.offerName,
            newPrice: offerFormData.newPrice,
            offerDescription: offerFormData.offerDescription,

        }

        try {
            const OfferResponse = await axios.post("http://localhost:8081/api/user/farmerOffers", OfferData);
            console.log('Data saved:', OfferResponse.data);

            setOfferFormData({
                offerName: "",
                newPrice: "",
                offerDescription: "",

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
        <div className=" p-6 bg-gray-100 min-h-screen ml-[4px] pt-[62px]">



            <div className="mt-6 flex gap-6">
            <form  onSubmit={handleSubmit} className="w-[725px]">
                {/* Product Form */}
                <div className="bg-white p-6 rounded-xl shadow-lg flex-1">
                    <div className="flex justify-center">
                        <div className="bg-gray-200 mb-[50px] p-6 bg-white border shadow-md shadow-gray-300 focus:ring-2 focus:ring-[#5C8F2B] rounded-lg flex flex-col items-center cursor-pointer" onClick={handleImageClick}>
                            {image ? (
                                <Image src={image} alt="Selected Product" className="w-24 h-24 object-cover rounded-lg" />
                            ) : (
                                <>
                                    <Image src = {Camera}  alt="Profile" width={45} height={45} />
                                    <p className="text-gray-600 font-poppins-regular">Product Image</p>
                                </>
                            )}
                        </div>
                        <input type="file" id="fileInput" name="productImage" value={formData.productImage || ''} className="hidden" onChange={handleFileChange} accept="image/*" />
                    </div>

                    <div className=" grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Product Name"
                            name="productName"
                            value={formData.productName || ''}
                            onChange={handleChange}
                            className="p-3 bg-white border  font-poppins-regular shadow-md  rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none  w-full" />
                        <select className="w-full shadow-md font-poppins-regular   border rounded-[20px] px-4 py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"
                            name="productCategory"
                            value={formData.productCategory || ''}>
                            onChange={handleChange}
                            <option value="#">Select your Product Category</option>
                            <option value="Vegetables">Vegetables</option>
                            <option value="Fruits">Fruits</option>
                            <option value="Cereals">Cereals</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Price (without offer)"
                            name="price"
                            value={formData.price || ''}
                            onChange={handleChange}
                            className="p-3 bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none  w-full" />
                        <input
                            type="date"
                            name="addedDate"
                            value={formData.addedDate || ''}
                            onChange={handleChange}
                            className="p-3 bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none  w-full" />
                        <input
                            type="number"
                            placeholder="Available Quantity (Kg)"
                            name="availableQuantity"
                            value={formData.availableQuantity || ''}
                            onChange={handleChange}
                            className="p-3 w-full bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none " />
                        <input
                            type="number"
                            placeholder="Minimum Quantity (Kg)"
                            name="minimumQuantity"
                            value={formData.minimumQuantity || ''}
                            onChange={handleChange}
                            className="p-3  w-full bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none" />
                        <textarea
                            placeholder="Description"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            className="p-3 bg-white w-full col-span-2 border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none"></textarea>
                    </div>

                    <button className="w-full h-[45px] mt-[20px] font-poppins-light  text-[16px] shadow-md shadow-gray-500 bg-[#88C34E] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300">Add Product</button>
                </div>

            </form>
            {/* Offers Section */}
            <form className="w-[300px]" onSubmit={handleSubmitOffer}>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-poppins-bold">Add offers</h2>
                    <input
                        type="text"
                        placeholder="Offer Name"
                        name="offerName"
                        value={offerFormData.offerName || ''}
                        onChange={handleOfferChange}
                        className="p-3 bg-white border mt-6 font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none  w-full" />
                    <textarea
                        placeholder="Offer Description"
                        name="offerDescription"
                        value={offerFormData.offerDescription || ''}
                        onChange={handleOfferChange}
                        className="p-3 mt-[15px] bg-white border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none  w-full"></textarea>
                    <input
                        type="number"
                        placeholder="New Price"
                        name="newPrice"
                        value={offerFormData.newPrice || ''}
                        onChange={handleOfferChange}
                        className="p-3 bg-white mt-[10px] border font-poppins-regular shadow-md shadow-gray-300 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none  w-full" />
                    <button className="w-full h-[45px] mt-[20px] font-poppins-light  text-[16px] shadow-md shadow-gray-500 bg-[#88C34E] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300">Add Offer</button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
                    <h2 className="text-lg font-poppins-bold">View available products</h2>
                    <button className="w-full h-[45px] mt-[25px] font-poppins-light  text-[16px] shadow-md shadow-gray-500 bg-[#88C34E] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300">View Products</button>
                </div>
            </form>
        </div>
        </div>
    );
}

export default FarmerDashboard;
