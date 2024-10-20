import Link from "next/link";

export default function Header() {
    return (
        <header className="bg-white text-black p-4 shadow-md">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    IMG master
                </Link>
                <ul className="flex space-x-4">
                    <li>
                        <Link href="/compress" className="hover:underline">
                            이미지 압축
                        </Link>
                    </li>
                    <li>
                        <Link href="/crop" className="hover:underline">
                            이미지 자르기
                        </Link>
                    </li>
                    {/* <li>
                        <Link href="/convert" className="hover:underline">
                            JPG로 변환
                        </Link>
                    </li>
                    <li>
                        <Link href="/edit" className="hover:underline">
                            포토 에디터
                        </Link>
                    </li> */}
                </ul>
            </nav>
        </header>
    );
}
