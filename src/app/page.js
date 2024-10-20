import Header from "../components/Header";

export const metadata = {
    title: "이미지 도구",
    description: "빠르고 간편한 이미지 편집 도구",
};

export default function Home() {
    return (
        <>
            <Header />
            <main className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">
                    이미지 도구에 오신 것을 환영합니다
                </h1>
                <p>상단 메뉴에서 원하는 도구를 선택하세요.</p>
            </main>
        </>
    );
}
