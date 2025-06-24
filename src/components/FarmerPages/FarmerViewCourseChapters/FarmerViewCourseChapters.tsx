"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination } from "@mui/material";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <div className="w-full flex justify-end mt-[-10px]">
            <div className="relative flex items-center">
                {/* Green circular search icon */}
                <div className="absolute left-0 flex items-center justify-center w-12 h-12 bg-[#88C34E] rounded-full z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Search input with left padding to accommodate the icon */}
                <input
                    type="text"
                    placeholder="Search chapters"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-14 pr-4 py-2 w-[280px] bg-white font-poppins-regular border-none shadow-md rounded-full focus:ring-2 focus:ring-[#88C34E] outline-none"
                />
            </div>
        </div>
    );
};

const ChapterCard = ({ chapter }) => {
    return (
        <div className="bg-white shadow-md rounded-[20px] p-6 mb-4 w-full hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                {/* Chapter Details - Left Side */}
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                        {/* Chapter Number Badge */}
                        <div className="bg-[#88C34E] text-white px-4 py-2 rounded-full font-poppins-bold text-sm">
                            Chapter {chapter.chapterNo}
                        </div>

                        {/* Chapter ID */}
                        {/*<p className="text-gray-500 font-poppins-regular text-sm">*/}
                        {/*    ID: #{chapter.chapterID}*/}
                        {/*</p>*/}
                    </div>

                    {/* Chapter Name */}
                    <h3 className="text-xl font-poppins-bold mb-3 text-gray-800">
                        {chapter.chapterName}
                    </h3>

                    {/* Chapter Description */}
                    <div className="mb-4">
                        <p className="text-gray-600 font-poppins-bold text-sm mb-2">Description:</p>
                        <div className="bg-gray-100 rounded-lg p-4">
                            <p className="text-gray-700 font-poppins-regular text-sm">
                                {chapter.chapterDescription || "No description available"}
                            </p>
                        </div>
                    </div>

                    {/* Trainer Information */}
                    {chapter.user && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-poppins-bold">Trainer:</span>
                            <span className="font-poppins-regular">
                                {chapter.user.firstName} {chapter.user.lastName}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="font-poppins-regular">
                                {chapter.user.userEmail}
                            </span>
                        </div>
                    )}
                </div>

                {/* Chapter Number Circle - Right Side */}
                <div className="flex-shrink-0 ml-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#88C34E] to-[#7AB33D] rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-poppins-bold text-xl">
                            {chapter.chapterNo}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CourseChaptersList = () => {
    const [chapters, setChapters] = useState([]);
    const [filteredChapters, setFilteredChapters] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [courseID, setCourseID] = useState(null);
    const itemsPerPage = 5;

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Get courseID from URL parameters
        const courseIdFromUrl = searchParams.get('courseID');
        if (courseIdFromUrl) {
            setCourseID(courseIdFromUrl);
            fetchChapters(courseIdFromUrl);
        } else {
            toast.error("Course ID not found. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
            setLoading(false);
        }
    }, [searchParams]);

    const fetchChapters = async (courseId) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewTrainerCourseChaptersByCourseID/${courseId}`
            );

            const chapterList = response.data.trainerCourseChaptersGetResponse || [];

            // Filter only active chapters (active=true)
            const activeChapters = chapterList.filter(chapter => chapter.active === true);

            // Sort chapters by chapter number
            const sortedChapters = activeChapters.sort((a, b) => a.chapterNo - b.chapterNo);

            setChapters(sortedChapters);
            setFilteredChapters(sortedChapters);
        } catch (error) {
            console.error("Error fetching chapters:", error);
            toast.error("Failed to fetch course chapters. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm) => {
        if (searchTerm.trim()) {
            const filtered = chapters.filter((chapter) =>
                chapter.chapterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chapter.chapterDescription.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredChapters(filtered);
        } else {
            setFilteredChapters(chapters);
        }
        // Reset to first page when searching
        setPage(1);
    };

    const handleChange = (event, value) => {
        setPage(value);
    };

    const paginatedChapters = filteredChapters.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    if (loading) {
        return (
            <div className="pt-[100px] p-6 bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#88C34E] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-poppins-regular">Loading chapters...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-[100px] p-6 bg-gray-100 min-h-screen relative">
            {/* Page Header */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => router.back()}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-poppins-bold transition-colors"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-poppins-bold text-gray-800">
                        Course Chapters
                    </h1>
                    {courseID && (
                        <span className="text-gray-500 font-poppins-regular">
                            (Course ID: {courseID})
                        </span>
                    )}
                </div>
            </div>

            {/* Fixed Search Bar */}
            <div className="fixed top-[100px] left-[260px] right-0 bg-gray-100 z-40 px-6 py-4 mt-4">
                <div className="flex justify-end">
                    <SearchBar onSearch={handleSearch} />
                </div>
            </div>

            {/* Chapters List with top margin to account for fixed search */}
            <div className="mt-20">
                {paginatedChapters.length > 0 ? (
                    paginatedChapters.map((chapter) => (
                        <ChapterCard
                            key={chapter.chapterID}
                            chapter={chapter}
                        />
                    ))
                ) : (
                    <div className="w-full text-center py-12">
                        <div className="bg-white rounded-lg p-8 shadow-md">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            </div>
                            <p className="text-gray-500 font-poppins-regular text-lg mb-2">
                                No chapters found
                            </p>
                            <p className="text-gray-400 font-poppins-regular text-sm">
                                {chapters.length === 0
                                    ? "This course doesn't have any active chapters yet."
                                    : "No chapters match your search criteria."
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredChapters.length > itemsPerPage && (
                <div className="flex justify-center mt-8">
                    <Pagination
                        count={Math.ceil(filteredChapters.length / itemsPerPage)}
                        page={page}
                        onChange={handleChange}
                        color="primary"
                    />
                </div>
            )}

            {/* Summary Info */}
            {filteredChapters.length > 0 && (
                <div className="mt-6 text-center">
                    <p className="text-gray-600 font-poppins-regular text-sm">
                        Showing {filteredChapters.length} active chapter{filteredChapters.length !== 1 ? 's' : ''}
                        {chapters.length !== filteredChapters.length && ` (filtered from ${chapters.length} total)`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CourseChaptersList;