import Header from "../../components/Header";
import ImageCropper from "../../components/ImageCropper";

export const metadata = {
    title: "초간편 이미지 자르기",
    description: "빠르고 간편한 이미지 크롭 도구",
};

export default function CropPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4 mt-8 text-center">
                    이미지 자르기
                </h1>
                <p className="text-lg text-gray-600 mb-8 text-center">
                    이미지를 자르고 크기를 조절합니다.
                </p>
                <div className="mb-8"></div>
                <ImageCropper />
            </main>
        </>
    );
}
