"use client";

import { useState } from "react";

export default function ImageUploader() {
    const [file, setFile] = useState(null);
    const [compressedImage, setCompressedImage] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("/api/compress", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                setCompressedImage(URL.createObjectURL(blob));
            } else {
                console.error("Image compression failed");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="w-full max-w-md">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
            >
                <div className="mb-4">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="image"
                    >
                        이미지 선택
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        압축하기
                    </button>
                </div>
            </form>
            {compressedImage && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold mb-2">압축된 이미지</h2>
                    <img
                        src={compressedImage}
                        alt="Compressed"
                        className="max-w-full h-auto"
                    />
                    <a
                        href={compressedImage}
                        download="compressed-image.jpg"
                        className="mt-2 inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        다운로드
                    </a>
                </div>
            )}
        </div>
    );
}
