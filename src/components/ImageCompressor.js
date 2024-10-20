"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import Image from "next/image";

export default function ImageCompressor() {
    const [images, setImages] = useState([]);
    const [compressedImages, setCompressedImages] = useState([]);
    const [quality, setQuality] = useState(60);
    const [isCompressing, setIsCompressing] = useState(false);
    const [totalCompressionResult, setTotalCompressionResult] = useState(null);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const onDrop = useCallback((acceptedFiles) => {
        setImages(
            acceptedFiles.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }))
        );
        setCompressedImages([]);
        setTotalCompressionResult(null);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/*": [],
        },
    });

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = document.createElement("img");
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const compressedDataUrl = canvas.toDataURL(
                        "image/jpeg",
                        quality / 100
                    );
                    resolve(compressedDataUrl);
                };
            };
        });
    };

    const handleCompress = async () => {
        setIsCompressing(true);
        const compressed = await Promise.all(
            images.map(async (img) => {
                const result = await compressImage(img.file);
                return {
                    name: img.file.name,
                    data: result,
                    originalSize: img.file.size,
                };
            })
        );
        setCompressedImages(compressed);
        setIsCompressing(false);

        // Calculate total compression result
        const totalOriginalSize = images.reduce(
            (sum, img) => sum + img.file.size,
            0
        );
        const totalCompressedSize = compressed.reduce((sum, img) => {
            const base64 = img.data.split(",")[1];
            const binaryString = atob(base64);
            return sum + binaryString.length;
        }, 0);
        const compressionPercentage = (
            ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) *
            100
        ).toFixed(2);

        setTotalCompressionResult({
            originalSize: totalOriginalSize,
            compressedSize: totalCompressedSize,
            percentage: compressionPercentage,
        });
    };

    const downloadAllImages = async () => {
        const zip = new JSZip();
        compressedImages.forEach((img) => {
            zip.file(`compressed_${img.name}`, img.data.split(",")[1], {
                base64: true,
            });
        });
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "compressed_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const removeImage = (index) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            {compressedImages.length === 0 && (
                <div className="mb-6">
                    {images.length > 0 ? (
                        <div>
                            <h2 className="text-xl font-semibold mb-2">
                                원본 이미지
                            </h2>
                            <div className="flex flex-wrap gap-4">
                                {images.map((img, index) => (
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
            {images.length > 0 && compressedImages.length === 0 && (
                <div className="mt-6 text-center">
                    <div className="mb-4">
                        <div className="flex flex-col items-center">
                            <label
                                htmlFor="quality"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                이미지 퀄리티: {quality}%
                            </label>
                            <div className="w-64 relative">
                                <input
                                    type="range"
                                    id="quality"
                                    name="quality"
                                    min="1"
                                    max="100"
                                    value={quality}
                                    onChange={(e) => setQuality(e.target.value)}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${quality}%, #E5E7EB ${quality}%, #E5E7EB 100%)`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleCompress}
                        className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out ${
                            isCompressing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isCompressing}
                    >
                        {isCompressing
                            ? "이미지를 압축 중입니다..."
                            : "이미지 압축"}
                    </button>
                </div>
            )}

            {compressedImages.length > 0 && (
                <div className="mt-6">
                    {totalCompressionResult && (
                        <div className="mb-6">
                            <div className="flex items-center justify-center space-x-4 h-64">
                                <div className="w-full max-w-md">
                                    <div className="mb-4">
                                        <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full"
                                                style={{
                                                    width: `${
                                                        100 -
                                                        totalCompressionResult.percentage
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="text-center mb-2 text-lg font-semibold text-black">
                                        총 {totalCompressionResult.percentage}%
                                        압축되었습니다
                                    </p>
                                    <p className="text-center mt-2">
                                        {formatFileSize(
                                            totalCompressionResult.originalSize
                                        )}{" "}
                                        →{" "}
                                        {formatFileSize(
                                            totalCompressionResult.compressedSize
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="mt-6 text-center">
                        <button
                            onClick={downloadAllImages}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out"
                        >
                            {compressedImages.length > 1
                                ? "모든 이미지 다운로드 (ZIP)"
                                : "이미지 다운로드"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
