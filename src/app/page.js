import ImageCompressor from "./components/ImageCompressor";
import Head from "next/head";
export const metadata = {
    title: "심플 이미지 압축",
    description: "가장 빠른 간편한 이미지 압축",
};

export default function Home() {
    return (
        <>
            <Head>
                <title>심플 이미지 압축</title>
                <meta
                    name="description"
                    content="가장 빠른 간편한 이미지 압축"
                />
                <meta property="og:title" content="이미지 압축" />
                <meta
                    property="og:description"
                    content="가장 빠른 간편한 이미지 압축"
                />
                <meta property="og:type" content="website" />
            </Head>
            <main className="min-h-screen bg-gray-100 py-12">
                <ImageCompressor />
            </main>
        </>
    );
}
