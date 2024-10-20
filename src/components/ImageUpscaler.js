"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

export default function ImageUpscaler() {
    const [image, setImage] = useState(null);
    const [size, setSize] = useState("2x");
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setImage({
                file: acceptedFiles[0],
                preview: URL.createObjectURL(acceptedFiles[0]),
            });
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/*": [],
        },
        multiple: false,
        maxSize: 5 * 1024 * 1024, // 5MB size limit
    });

    const handleSizeChange = (e) => {
        setSize(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            setError("No image selected");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const base64Image = await readFileAsBase64(image.file);
            const response = await fetch("/api/upscale", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ image: base64Image, size }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Upscaling failed");
            }

            const data = await response.json();
            if (
                Array.isArray(data.result) &&
                data.result.length > 0 &&
                data.result[0].url
            ) {
                setResult(data.result[0].url);
            } else {
                throw new Error("Unexpected result format");
            }
        } catch (error) {
            console.error("Error upscaling image:", error);
            setError(
                `이미지 업스케일 중 오류가 발생했습니다: ${error.message}`
            );
        } finally {
            setIsLoading(false);
        }
    };

    const readFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleClear = () => {
        setImage(null);
        setResult(null);
        setError(null);
    };

    useEffect(() => {
        return () => {
            if (image) {
                URL.revokeObjectURL(image.preview);
            }
        };
    }, [image]);

    return (
        <>
            <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!image ? (
                        <div
                            {...getRootProps()}
                            className="p-10 border-2 border-dashed rounded-lg text-center cursor-pointer"
                        >
                            <input {...getInputProps()} />
                            <p className="text-gray-500">
                                이미지를 드래그 앤 드롭하거나 클릭하여
                                선택하세요
                            </p>
                        </div>
                    ) : (
                        <div className="flex space-x-4">
                            <div className="w-1/2">
                                <h2 className="text-xl font-semibold mb-2">
                                    선택된 이미지
                                </h2>
                                <div className="relative group">
                                    <Image
                                        src={image.preview}
                                        alt="Preview"
                                        width={Math.min(
                                            image.width || 200,
                                            400
                                        )}
                                        height={Math.min(200, 400)}
                                        className="object-cover rounded"
                                        style={{
                                            width: "100%",
                                            height: "auto",
                                            maxWidth: "400px",
                                            maxHeight: "400px",
                                        }}
                                    />
                                    {!isLoading && !result && (
                                        <button
                                            onClick={() => setImage(null)}
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
                                    )}
                                </div>
                            </div>
                            <div className="w-1/2">
                                <h2 className="text-xl font-semibold mb-2">
                                    {result ? "결과" : ""}
                                </h2>
                                {!result ? (
                                    <div className="flex flex-col justify-center space-y-4">
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="text-center">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    해상도 선택
                                                </label>
                                                <div className="flex justify-center space-x-4">
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            className="form-radio"
                                                            name="resolution"
                                                            value="2x"
                                                            checked={
                                                                size === "2x"
                                                            }
                                                            onChange={
                                                                handleSizeChange
                                                            }
                                                            disabled={isLoading}
                                                        />
                                                        <span className="ml-2">
                                                            2x
                                                        </span>
                                                    </label>
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            className="form-radio"
                                                            name="resolution"
                                                            value="4x"
                                                            checked={
                                                                size === "4x"
                                                            }
                                                            onChange={
                                                                handleSizeChange
                                                            }
                                                            disabled={isLoading}
                                                        />
                                                        <span className="ml-2">
                                                            4x
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="w-full max-w-sm">
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        isLoading || !image
                                                    }
                                                    className={`
                                                        w-full font-bold py-2 px-8 rounded-lg transition duration-300 ease-in-out text-lg
                                                        ${
                                                            isLoading || !image
                                                                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                                                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                                        }
                                                    `}
                                                >
                                                    {isLoading ? (
                                                        <div className="flex items-center justify-center">
                                                            <svg
                                                                className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                ></path>
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        "업스케일"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <Image
                                            src={result}
                                            alt="Upscaled"
                                            width={Math.min(
                                                result.width || 200,
                                                400
                                            )}
                                            height={Math.min(200, 400)}
                                            className="object-cover rounded"
                                            style={{
                                                width: "100%",
                                                height: "auto",
                                                maxWidth: "400px",
                                                maxHeight: "400px",
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </form>
                {error && (
                    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
            </div>
            {result && (
                <div className="mt-6 flex justify-center space-x-4">
                    <button
                        onClick={handleClear}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-8 rounded-lg transition duration-300 ease-in-out w-48"
                    >
                        Clear
                    </button>
                    <a
                        href={result}
                        download={`${
                            image.file.name.split(".")[0]
                        }_upscaled.webp`}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg transition duration-300 ease-in-out w-48 flex items-center justify-center"
                    >
                        다운로드
                    </a>
                </div>
            )}
        </>
    );
}
