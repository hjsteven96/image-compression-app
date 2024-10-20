"use client";

import { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

export default function AdvancedImageCropper() {
    const [imageSrc, setImageSrc] = useState(null);
    const [croppedImageData, setCroppedImageData] = useState(null);
    const [originalFileName, setOriginalFileName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cropData, setCropData] = useState({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
    });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const imageRef = useRef(null);
    const cropperRef = useRef(null);
    const containerRef = useRef(null);

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setOriginalFileName(file.name);
            setIsLoading(true);
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImageSrc(reader.result);
                setIsLoading(false);
            });
            reader.readAsDataURL(file);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        multiple: false,
    });

    useEffect(() => {
        if (imageSrc && imageRef.current) {
            const img = new Image();
            img.onload = () => {
                setImageSize({ width: img.width, height: img.height });
            };
            img.src = imageSrc;
        }
    }, [imageSrc]);

    useEffect(() => {
        if (
            imageSrc &&
            imageRef.current &&
            imageSize.width &&
            imageSize.height
        ) {
            if (cropperRef.current) {
                cropperRef.current.destroy();
            }

            const containerWidth = containerRef.current.offsetWidth;
            const scale = containerWidth / imageSize.width;
            const scaledHeight = imageSize.height * scale;

            const initialCropBoxWidth = imageSize.width * 0.8;
            const initialCropBoxHeight = imageSize.height * 0.8;
            const initialX = (imageSize.width - initialCropBoxWidth) / 2;
            const initialY = (imageSize.height - initialCropBoxHeight) / 2;

            cropperRef.current = new Cropper(imageRef.current, {
                viewMode: 1,
                dragMode: "crop",
                aspectRatio: NaN,
                autoCropArea: 0.8,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                movable: false,
                zoomable: false,
                rotatable: false,
                scalable: false,
                width: containerWidth,
                height: scaledHeight,
                data: {
                    width: initialCropBoxWidth,
                    height: initialCropBoxHeight,
                    x: initialX,
                    y: initialY,
                },
                crop: (event) => {
                    const { width, height, x, y } = event.detail;
                    setCropData({
                        width: Math.round(width),
                        height: Math.round(height),
                        x: Math.round(x),
                        y: Math.round(y),
                    });
                },
            });
        }
    }, [imageSrc, imageSize]);

    const getCroppedImg = () => {
        if (cropperRef.current) {
            const croppedCanvas = cropperRef.current.getCroppedCanvas();
            const croppedDataUrl = croppedCanvas.toDataURL("image/jpeg");
            const croppedData = {
                name: originalFileName,
                dataUrl: croppedDataUrl,
            };
            setCroppedImageData(croppedData);
            downloadImage(croppedData);
        }
    };

    const downloadImage = (imageData) => {
        if (!imageData) return;

        const link = document.createElement("a");
        link.href = imageData.dataUrl;
        const fileExtension = imageData.name.split(".").pop();
        const baseFilename = imageData.name.slice(
            0,
            -(fileExtension.length + 1)
        );
        link.download = `${baseFilename}_cropped.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCropDataChange = (key, value) => {
        setCropData((prev) => ({ ...prev, [key]: parseInt(value, 10) }));
        if (cropperRef.current) {
            cropperRef.current.setData({ [key]: parseInt(value, 10) });
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold mb-6 text-center text-black">
                이미지 자르기
            </h1>

            {!imageSrc && (
                <div
                    {...getRootProps()}
                    className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${
                        isDragActive ? "border-blue-500" : "border-gray-300"
                    }`}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className="text-gray-500">
                            이미지를 여기에 놓으세요.
                        </p>
                    ) : (
                        <p className="text-gray-500">
                            이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요
                        </p>
                    )}
                </div>
            )}

            {isLoading && (
                <div className="text-center mt-4">
                    <p>이미지를 로딩 중입니다...</p>
                </div>
            )}

            {imageSrc && !croppedImageData && (
                <div className="mt-6 flex flex-col md:flex-row">
                    <div
                        ref={containerRef}
                        className="flex-1 mb-4 md:mb-0 overflow-hidden"
                    >
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Upload"
                            style={{ maxWidth: "100%", display: "block" }}
                        />
                    </div>
                    <div className="md:ml-4 md:w-64">
                        <h3 className="text-lg font-semibold mb-2">
                            잘라내기 옵션
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <span className="w-16 text-sm">너비:</span>
                                <input
                                    type="number"
                                    value={cropData.width}
                                    onChange={(e) =>
                                        handleCropDataChange(
                                            "width",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="flex items-center">
                                <span className="w-16 text-sm">높이:</span>
                                <input
                                    type="number"
                                    value={cropData.height}
                                    onChange={(e) =>
                                        handleCropDataChange(
                                            "height",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="flex items-center">
                                <span className="w-16 text-sm">X 위치:</span>
                                <input
                                    type="number"
                                    value={cropData.x}
                                    onChange={(e) =>
                                        handleCropDataChange(
                                            "x",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="flex items-center">
                                <span className="w-16 text-sm">Y 위치:</span>
                                <input
                                    type="number"
                                    value={cropData.y}
                                    onChange={(e) =>
                                        handleCropDataChange(
                                            "y",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                        </div>
                        <button
                            onClick={getCroppedImg}
                            className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                        >
                            이미지 자르기 및 다운로드
                        </button>
                    </div>
                </div>
            )}

            {croppedImageData && (
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-2 text-black">
                        잘라낸 이미지:
                    </h2>
                    <img
                        src={croppedImageData.dataUrl}
                        alt="Cropped"
                        className="mb-4 max-w-full h-auto rounded"
                    />
                    <p className="text-green-600 font-semibold">
                        이미지가 성공적으로 다운로드되었습니다.
                    </p>
                </div>
            )}
        </div>
    );
}
