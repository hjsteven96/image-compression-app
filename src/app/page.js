import Header from "../components/Header";
import Link from "next/link";

export const metadata = {
    title: "이미지 도구",
    description: "빠르고 간편한 이미지 편집 도구",
};

export default function Home() {
    return (
        <>
            <Header />
            <main className="container mx-auto p-4">
                <div className="flex flex-col items-center pt-16">
                    <h1 className="text-3xl font-bold mb-4">
                        이미지 도구에 오신 것을 환영합니다
                    </h1>
                    <p className="text-lg text-gray-600 mb-8"></p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Link href="/compress" className="block">
                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <h2 className="text-xl font-semibold mb-2">
                                    이미지 압축
                                </h2>
                                <p className="text-gray-600">
                                    이미지 파일 크기를 줄이세요
                                </p>
                            </div>
                        </Link>
                        <Link href="/crop" className="block">
                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <h2 className="text-xl font-semibold mb-2">
                                    이미지 자르기
                                </h2>
                                <p className="text-gray-600">
                                    이미지를 원하는 크기로 자르세요
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
