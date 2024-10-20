import Header from "../../components/Header";
import ImageConverter from "../../components/ImageConverter";

export const metadata = {
    title: "이미지를 JPG로 변환",
    description:
        "PNG, GIF, TIF, PSD, SVG, WEBP, HEIC 또는 RAW 이미지를 JPG 형식으로 변환합니다.",
};

export default function ConvertToJpgPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4 mt-8 text-center">
                    JPG로 변환
                </h1>
                <p className="text-lg text-gray-600 mb-8 text-center">
                    PNG, GIF, TIF, PSD, SVG, WEBP, HEIC 또는 RAW 이미지를 JPG
                    형식으로 변환합니다.
                </p>
                <div className="mb-8"></div>
                <ImageConverter />
            </main>
        </>
    );
}
