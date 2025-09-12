import sharp from "sharp";

export async function imgToWebp(buffer, type) {
    return sharp(Buffer.from(buffer, "base64"))
        .resize(512, 512, {
            fit: type,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ lossless: true })
        .toBuffer();
}
