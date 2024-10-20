import Header from "../../components/Header";
import ImageCompressor from "../../components/ImageCompressor";

export const metadata = {
    title: "초간편 이미지 압축",
    description: "빠르고 간편한 이미지 압축 도구",
};

export default function CompressPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4 mt-8 text-center">
                    이미지 압축
                </h1>
                <p className="text-lg text-gray-600 mb-8 text-center">
                    이미지를 압축하여 크기를 줄입니다.
                </p>
                <div className="mb-8"></div>
                <ImageCompressor />
            </main>
        </>
    );
}
