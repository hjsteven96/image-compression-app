import { NextResponse } from "next/server";
import sharp from "sharp";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request) {
    const data = await request.formData();
    const file = data.get("image");

    if (!file) {
        return NextResponse.json(
            { error: "No file uploaded" },
            { status: 400 }
        );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const compressedImage = await sharp(buffer)
        .resize(800) // 최대 너비 800px로 조정
        .jpeg({ quality: 80 }) // JPEG 포맷으로 변환, 품질 80%
        .toBuffer();

    // 압축된 이미지를 임시 파일로 저장
    const tempFilePath = join("/tmp", `compressed-${Date.now()}.jpg`);
    await writeFile(tempFilePath, compressedImage);

    return new NextResponse(compressedImage, {
        headers: {
            "Content-Type": "image/jpeg",
            "Content-Disposition":
                'attachment; filename="compressed-image.jpg"',
        },
    });
}
