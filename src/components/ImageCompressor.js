"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import JSZip from "jszip";

export default function ImageCompressor() {
    const [images, setImages] = useState([]);
    const [compressedImages, setCompressedImages] = useState([]);
    const [quality, setQuality] = useState(60);

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
                name: file.name,
                size: file.size,
            }))
        );
        setCompressedImages([]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        multiple: true,
    });

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
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
                    const compressedSize = Math.round(
                        ((compressedDataUrl.length -
                            "data:image/jpeg;base64,".length) *
                            3) /
                            4
                    );
                    resolve({
                        name: file.name,
                        originalSize: file.size,
                        compressedSize: compressedSize,
                        compressedDataUrl: compressedDataUrl,
                        ratio: ((1 - compressedSize / file.size) * 100).toFixed(
                            2
                        ),
                    });
                };
            };
        });
    };

    const compressAllImages = async () => {
        const compressed = await Promise.all(
            images.map((image) => compressImage(image.file))
        );
        setCompressedImages(compressed);
    };

    const downloadImage = (compressedImage) => {
        const link = document.createElement("a");
        link.href = compressedImage.compressedDataUrl;
        const fileExtension = compressedImage.name.split(".").pop();
        const baseFilename = compressedImage.name.slice(
            0,
            -(fileExtension.length + 1)
        );
        link.download = `${baseFilename}_compressed.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadAllAsZip = async () => {
        const zip = new JSZip();
        compressedImages.forEach((image) => {
            const fileExtension = image.name.split(".").pop();
            const baseFilename = image.name.slice(
                0,
                -(fileExtension.length + 1)
            );
            const fileName = `${baseFilename}_compressed.${fileExtension}`;
            const base64Data = image.compressedDataUrl.split(",")[1];
            zip.file(fileName, base64Data, { base64: true });
        });
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "compressed_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getTotalCompressionRatio = () => {
        if (compressedImages.length === 0) return 0;
        const totalOriginalSize = compressedImages.reduce(
            (sum, img) => sum + img.originalSize,
            0
        );
        const totalCompressedSize = compressedImages.reduce(
            (sum, img) => sum + img.compressedSize,
            0
        );
        return ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(0);
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            {compressedImages.length === 0 && (
                <div
                    {...getRootProps()}
                    className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${
                        isDragActive ? "border-primary" : "border-gray-300"
                    }`}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className="text-gray-500">
                            이미지를 여기에 놓으세요.
                        </p>
                    ) : (
                        <p className="text-gray-500">
                            이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요{" "}
                            <br />
                            (여러 개 선택 가능)
                        </p>
                    )}
                </div>
            )}

            {images.length > 0 && compressedImages.length === 0 && (
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2 text-black">
                        선택된 이미지:
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {images.map((image, index) => (
                            <div key={index} className="border rounded p-2">
                                <img
                                    src={image.preview}
                                    alt={image.name}
                                    className="w-full h-32 object-cover mb-2"
                                />
                                <p className="text-sm truncate text-black">
                                    {image.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(image.size)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                        <Label
                            htmlFor="quality"
                            className="whitespace-nowrap text-black w-12 text-center"
                        >
                            품<br />질
                        </Label>
                        <Slider
                            id="quality"
                            min={1}
                            max={100}
                            value={[quality]}
                            onValueChange={(value) => setQuality(value[0])}
                            className="flex-grow"
                        />
                        <span className="w-12 text-right text-black">
                            {quality}%
                        </span>
                    </div>
                    <Button onClick={compressAllImages} className="mt-4 w-full">
                        이미지 압축
                    </Button>
                </div>
            )}

            {compressedImages.length > 0 && (
                <div className="mt-6">
                    <div className="mb-4">
                        <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full"
                                style={{
                                    width: `${
                                        100 - getTotalCompressionRatio()
                                    }%`,
                                }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-center mb-2 text-lg font-semibold text-black">
                        총 {getTotalCompressionRatio()}% 압축
                    </p>
                    <p className="text-center text-sm text-gray-600 mb-6">
                        {formatFileSize(
                            compressedImages.reduce(
                                (sum, img) => sum + img.originalSize,
                                0
                            )
                        )}{" "}
                        →{" "}
                        {formatFileSize(
                            compressedImages.reduce(
                                (sum, img) => sum + img.compressedSize,
                                0
                            )
                        )}
                    </p>
                    <Button
                        onClick={
                            compressedImages.length > 1
                                ? downloadAllAsZip
                                : () => downloadImage(compressedImages[0])
                        }
                        className="w-full py-3 text-lg font-semibold mb-8"
                    >
                        압축된 이미지 다운로드
                    </Button>
                    <div className="h-10"></div>

                    <div className="border-t border-gray-200 pt-8 mb-6">
                        <h3 className="text-xl mb-4 text-black">
                            이미지 압축 상세
                        </h3>
                    </div>

                    <ul className="space-y-6">
                        {compressedImages.map((compressedImage, index) => (
                            <li
                                key={index}
                                className="border p-4 rounded shadow-sm"
                            >
                                <div className="flex flex-col sm:flex-row">
                                    <div className="w-full sm:w-1/3 mb-4 sm:mb-0 sm:mr-4">
                                        <img
                                            src={
                                                compressedImage.compressedDataUrl
                                            }
                                            alt={compressedImage.name}
                                            className="w-full h-auto object-cover rounded"
                                        />
                                    </div>
                                    <div className="w-full sm:w-2/3">
                                        <p className="mb-2 text-black">
                                            {compressedImage.name}
                                        </p>
                                        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{
                                                    width: `${compressedImage.ratio}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            압축률: {compressedImage.ratio}%
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            원본 크기:{" "}
                                            {formatFileSize(
                                                compressedImage.originalSize
                                            )}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            압축 후 크기:{" "}
                                            {formatFileSize(
                                                compressedImage.compressedSize
                                            )}
                                        </p>
                                        <Button
                                            onClick={() =>
                                                downloadImage(compressedImage)
                                            }
                                            className="mt-4"
                                        >
                                            다운로드
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
