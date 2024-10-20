"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import Image from "next/image";

export default function ImageConverter() {
    const [originalImages, setOriginalImages] = useState([]);
    const [convertedImages, setConvertedImages] = useState([]);
    const [isConverting, setIsConverting] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        setOriginalImages((prevImages) => [
            ...prevImages,
            ...acceptedFiles.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            })),
        ]);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/png": [".png"],
            "image/gif": [".gif"],
            "image/tiff": [".tif", ".tiff"],
            "image/svg+xml": [".svg"],
            "image/webp": [".webp"],
            "image/heic": [".heic"],
            "image/x-adobe-dng": [".dng"],
            "image/x-canon-cr2": [".cr2"],
            "image/x-nikon-nef": [".nef"],
            "image/x-sony-arw": [".arw"],
        },
    });

    const convertToJpg = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new window.Image(); // Use the native Image object
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL("image/jpeg", 0.9));
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleConvert = async () => {
        setIsConverting(true);
        const converted = await Promise.all(
            originalImages.map(async (img) => {
                const result = await convertToJpg(img.file);
                return { name: img.file.name, data: result };
            })
        );
        setConvertedImages(converted);
        setIsConverting(false);
    };

    const downloadSingleImage = (img) => {
        const link = document.createElement("a");
        link.href = img.data;
        link.download = `${img.name.split(".")[0]}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadAllImages = async () => {
        const zip = new JSZip();
        convertedImages.forEach((img) => {
            zip.file(`${img.name.split(".")[0]}.jpg`, img.data.split(",")[1], {
                base64: true,
            });
        });
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "converted_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const removeImage = (index) => {
        setOriginalImages((prevImages) =>
            prevImages.filter((_, i) => i !== index)
        );
    };

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            {convertedImages.length === 0 && (
                <div className="mb-6">
                    {originalImages.length > 0 ? (
                        <div>
                            <h2 className="text-xl font-semibold mb-2">
                                원본 이미지
                            </h2>
                            <div className="flex flex-wrap gap-4">
                                {originalImages.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <Image
                                            src={img.preview}
                                            alt={`Preview ${index}`}
                                            width={150}
                                            height={150}
                                            className="object-cover rounded"
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                        <p className="text-gray-500 text-sm mt-1 truncate w-36">
                                            {img.file.name}
                                        </p>
                                    </div>
                                ))}
                                <div
                                    {...getRootProps()}
                                    className="w-36 h-36 border-2 border-dashed rounded flex items-center justify-center cursor-pointer"
                                >
                                    <input {...getInputProps()} />
                                    <span className="text-4xl text-gray-400">
                                        +
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            {...getRootProps()}
                            className="p-10 border-2 border-dashed rounded-lg text-center cursor-pointer"
                        >
                            <input {...getInputProps()} />
                            <p className="text-gray-500">
                                이미지를 드래그 앤 드롭하거나 클릭하여
                                선택하세요
                                <br />
                                (여러 개 선택 가능)
                            </p>
                        </div>
                    )}
                </div>
            )}
            {originalImages.length > 0 && convertedImages.length === 0 && (
                <div className="mt-6 text-center">
                    <button
                        onClick={handleConvert}
                        className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out ${
                            isConverting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isConverting}
                    >
                        {isConverting
                            ? "이미지를 변환 중입니다..."
                            : "이미지 변환"}
                    </button>
                </div>
            )}

            {convertedImages.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">
                        변환된 이미지
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {convertedImages.map((img, index) => (
                            <div
                                key={index}
                                className="bg-gray-100 rounded-lg p-4 relative group"
                            >
                                <p className="text-sm text-gray-600 truncate mb-2">
                                    {img.name.split(".")[0]}.jpg
                                </p>
                                <Image
                                    src={img.data}
                                    alt={`Converted ${index}`}
                                    width={200}
                                    height={200}
                                    className="object-cover rounded-lg mb-2"
                                />
                                <button
                                    onClick={() => downloadSingleImage(img)}
                                    className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="다운로드"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 text-center">
                        <button
                            onClick={downloadAllImages}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out"
                        >
                            {convertedImages.length > 1
                                ? "모든 이미지 다운로드 (ZIP)"
                                : "이미지 다운로드"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
