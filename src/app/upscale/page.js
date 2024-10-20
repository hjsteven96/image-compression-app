import ImageUpscaler from "@/components/ImageUpscaler";
import Header from "@/components/Header";

export default function Home() {
    return (
        <>
            <Header />
            <main className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4 mt-8 text-center">
                    이미지 업스케일러
                </h1>
                <p className="text-lg text-gray-600 mb-8 text-center">
                    고품질 이미지 업스케일 서비스를 이용해보세요.
                </p>
                <ImageUpscaler />
            </main>
        </>
    );
}
