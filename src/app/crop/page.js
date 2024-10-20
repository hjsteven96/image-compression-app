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
            <main className="container mx-auto p-4">
                <ImageCropper />
            </main>
        </>
    );
}
