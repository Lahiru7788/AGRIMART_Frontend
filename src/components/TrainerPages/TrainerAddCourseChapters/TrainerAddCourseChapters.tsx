'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from "axios";
import { toast } from "react-toastify";
import { getWithExpiry } from "../../../../auth-utils";
import { Edit2, Trash2, X } from 'lucide-react';

interface User {
    userID: number;
    userEmail: string;
    firstName: string;
    lastName: string;
    userType: string;
}

interface Chapter {
    chapterID: number;
    chapterName: string;
    chapterNo: number;
    chapterDescription: string;
    user: User;
    active: boolean;
}

interface ChapterFormData {
    chapterName: string;
    chapterNo: string;
    chapterDescription: string;
}

const TrainerAddCourseChapters: React.FC = () => {
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId');

    const [userID, setUserID] = useState<number | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);

    const [formData, setFormData] = useState<ChapterFormData>({
        chapterName: "",
        chapterNo: "",
        chapterDescription: "",
    });

    // Get user ID on component mount
    useEffect(() => {
        const userData = getWithExpiry('user');
        if (userData && userData.userID) {
            setUserID(userData.userID);
        }
    }, []);

    // Fetch chapters when component mounts and when courseId changes
    useEffect(() => {
        if (courseId) {
            fetchChapters();
        }
    }, [courseId]);

    // Fetch chapters from API
    const fetchChapters = async () => {
        if (!courseId) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8081/api/user/viewTrainerCourseChaptersByCourseID/${courseId}`,
                { withCredentials: true }
            );

            if (response.data && response.data.trainerCourseChaptersGetResponse) {
                // Filter for only active chapters
                const activeChapters = response.data.trainerCourseChaptersGetResponse.filter(
                    chapter => chapter.active === true
                );
                setChapters(activeChapters);
            }
        } catch (error) {
            console.error('Error fetching chapters:', error);
            toast.error('Failed to fetch chapters. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Submit chapter form (both create and update)
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!courseId) {
            toast.error('User ID or Course ID not found.', {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        const chapterData = {
            chapterName: formData.chapterName,
            chapterNo: parseInt(formData.chapterNo),
            chapterDescription: formData.chapterDescription,
            userID: userID,
            courseID: parseInt(courseId),
            ...(editingChapter && { chapterID: editingChapter.chapterID })
        };

        try {
            const response = await axios.post(
                "http://localhost:8081/api/user/trainerCourseChapters",
                chapterData,
                { withCredentials: true }
            );

            console.log('Chapter saved:', response.data);

            // Reset form
            setFormData({
                chapterName: "",
                chapterNo: "",
                chapterDescription: "",
            });
            setEditingChapter(null);

            toast.success(editingChapter ? 'Chapter updated successfully!' : 'Chapter added successfully!', {
                position: "top-right",
                autoClose: 5000,
            });

            // Refresh chapters list
            fetchChapters();

        } catch (error) {
            console.error('Error saving chapter:', error);
            toast.error('Failed to save chapter. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    // Handle edit chapter
    const handleEdit = (chapter: Chapter) => {
        setEditingChapter(chapter);
        setFormData({
            chapterName: chapter.chapterName,
            chapterNo: chapter.chapterNo.toString(),
            chapterDescription: chapter.chapterDescription,
        });
    };

    // Open delete confirmation modal
    const openDeleteModal = (chapter: Chapter) => {
        setChapterToDelete(chapter);
        setShowDeleteModal(true);
    };

    // Close delete confirmation modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setChapterToDelete(null);
    };

    // Handle delete chapter confirmation
    const confirmDelete = async () => {
        if (!chapterToDelete) return;

        try {
            await axios.put(
                `http://localhost:8081/api/user/trainer-course-chapters/${chapterToDelete.chapterID}/delete`,
                { withCredentials: true }
            );

            toast.success('Chapter deleted successfully!', {
                position: "top-right",
                autoClose: 5000,
            });

            // Refresh chapters list
            fetchChapters();
            closeDeleteModal();

        } catch (error) {
            console.error('Error deleting chapter:', error);
            toast.error('Failed to delete chapter. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    // Cancel edit
    const cancelEdit = () => {
        setEditingChapter(null);
        setFormData({
            chapterName: "",
            chapterNo: "",
            chapterDescription: "",
        });
    };

    if (!courseId) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <p className="text-red-500 font-poppins-regular">Course ID not found. Please go back and complete the course creation process.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen pt-[92px]">
            <div className="max-w-4xl mx-auto">
                {/* Chapter Form */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                    <h2 className="text-xl font-poppins-bold mb-6 text-center">
                        {editingChapter ? 'Edit Chapter' : 'Add Course Chapter'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Chapter Name"
                                name="chapterName"
                                value={formData.chapterName}
                                onChange={handleChange}
                                className="p-3 bg-white border font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                required
                            />

                            <input
                                type="number"
                                placeholder="Chapter Number"
                                name="chapterNo"
                                value={formData.chapterNo}
                                onChange={handleChange}
                                className="p-3 bg-white border font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                required
                            />

                            <textarea
                                placeholder="Chapter Description"
                                name="chapterDescription"
                                value={formData.chapterDescription}
                                onChange={handleChange}
                                className="p-3 bg-white col-span-2 border font-poppins-regular shadow-md shadow-gray-200 rounded-[20px] py-2 focus:ring-2 focus:ring-[#5C8F2B] outline-none w-full"
                                rows={4}
                                required
                            ></textarea>
                        </div>

                        <div className="flex gap-4 mt-6">
                            {editingChapter && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="w-1/2 h-[45px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-[20px] transition duration-300"
                                >
                                    Cancel
                                </button>
                            )}

                            <button
                                type="submit"
                                className={`${editingChapter ? 'w-1/2' : 'w-full'} h-[45px] font-poppins-light text-[16px] shadow-md shadow-gray-500 bg-[#88C34E] hover:bg-[#B3FDBB] hover:text-[#5C8F2B] text-white font-semibold py-2 rounded-[20px] transition duration-300`}
                            >
                                {editingChapter ? 'Update Chapter' : 'Save Chapter'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Chapters Table */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-poppins-bold mb-4">Course Chapters</h3>

                    {loading ? (
                        <div className="text-center py-4">
                            <p className="font-poppins-regular text-gray-600">Loading chapters...</p>
                        </div>
                    ) : chapters.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="font-poppins-regular text-gray-600">No chapters added yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-200 p-3 text-left font-poppins-regular">Chapter No.</th>
                                    <th className="border border-gray-200 p-3 text-left font-poppins-regular">Chapter Name</th>
                                    <th className="border border-gray-200 p-3 text-left font-poppins-regular">Description</th>
                                    <th className="border border-gray-200 p-3 text-left font-poppins-regular">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {chapters.map((chapter) => (
                                    <tr key={chapter.chapterID} className="hover:bg-gray-50">
                                        <td className="border border-gray-200 p-3 font-poppins-regular">
                                            {chapter.chapterNo}
                                        </td>
                                        <td className="border border-gray-200 p-3 font-poppins-regular">
                                            {chapter.chapterName}
                                        </td>
                                        <td className="border border-gray-200 p-3 font-poppins-regular">
                                            {chapter.chapterDescription}
                                        </td>
                                        <td className="border border-gray-200 p-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(chapter)}
                                                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-200"
                                                    title="Edit Chapter"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(chapter)}
                                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200"
                                                    title="Delete Chapter"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-poppins-bold text-gray-800">Confirm Delete</h3>
                            <button
                                onClick={closeDeleteModal}
                                className="text-gray-400 hover:text-gray-600 transition duration-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 font-poppins-regular mb-2">
                                Are you sure you want to delete this chapter?
                            </p>
                            {chapterToDelete && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-poppins-medium text-gray-800">
                                        Chapter {chapterToDelete.chapterNo}: {chapterToDelete.chapterName}
                                    </p>
                                </div>
                            )}
                            <p className="text-red-500 font-poppins-regular text-sm mt-2">
                                This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-poppins-regular rounded-lg transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-poppins-regular rounded-lg transition duration-200"
                            >
                                Delete Chapter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerAddCourseChapters;