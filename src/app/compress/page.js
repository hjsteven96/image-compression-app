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
            <main className="container mx-auto p-4">
                <ImageCompressor />
            </main>
        </>
    );
}
