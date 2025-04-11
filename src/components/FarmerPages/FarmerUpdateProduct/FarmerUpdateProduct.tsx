"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination } from "@mui/material";
import Image from "next/image";

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white shadow-md rounded-[20px] p-4 w-80">
            <h2 className="text-gray-600 font-poppins-bold">
                Product #{product.productID}
            </h2>
            <p className="text-gray-400 font-poppins-regular text-sm">
                {product.addedDate}
            </p>
            <h3 className="text-lg font-poppins-bold text-center">
                {product.productName}
            </h3>
            {product.imageUrl ? (
                <Image
                    src={product.imageUrl}
                    alt={product.productName}
                    width={96}
                    height={96}
                    className="mx-auto"
                />
            ) : (
                <p>No image available</p>
            )}
            <p className="text-[#88C34E] font-poppins-bold">
                Available Quantity: {product.availableQuantity}Kg
            </p>
            <p className="text-black font-poppins-bold">
                1KG Price: Rs. {product.price}
            </p>
            <p className="text-gray-600 font-poppins-bold">
                Description: {product.description}
            </p>
            <div className="flex justify-between mt-4">
                <button className="text-green-600 text-xl">⚙</button>
                <button className="text-red-600 text-xl">🗑</button>
            </div>
        </div>
    );
};

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 3;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8081/api/user/viewFarmerProducts"
                );

                const productList = response.data.farmerProductGetResponse || [];

                // Now fetch images for each product using productID
                const productsWithImages = await Promise.all(
                    productList.map(async (product) => {
                        // Make an API call to get imageID based on productID
                        if (product.productID) {
                            try {
                                const imageResponse = await axios.get(
                                    `http://localhost:8081/api/user/viewFarmerProductImage?productID=${product.productID}`,
                                    { responseType: "blob" }
                                );
                                const imageUrl = URL.createObjectURL(imageResponse.data);

                                return { ...product, imageUrl }; // Add imageUrl to the product
                            } catch (error) {
                                console.error(`Error fetching image for product ${product.productID}:`, error);
                            }
                        }
                        return { ...product, imageUrl: null }; // Return product with no image if not found
                    })
                );

                setProducts(productsWithImages);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    const handleChange = (event, value) => {
        setPage(value);
    };

    const paginatedProducts = products.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="pt-[100px] p-6 bg-gray-100 min-h-screen">
            <div className="flex flex-wrap gap-6">
                {paginatedProducts.map((product) => (
                    <ProductCard key={product.productID} product={product} />
                ))}
            </div>
            <div className="flex justify-center mt-[30px]">
                <Pagination
                    count={Math.ceil(products.length / itemsPerPage)}
                    page={page}
                    onChange={handleChange}
                    color="primary"
                />
            </div>
        </div>
    );
};

export default ProductList;
