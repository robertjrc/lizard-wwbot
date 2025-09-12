import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import { tempFile } from "../../utils/tempFile.js";
import fs from "node:fs/promises";

const { ffmpeg_path } = await (await import("../../utils/importJson.js")).importJson("src/config/settings.json");

ffmpeg.setFfmpegPath(ffmpeg_path);

export async function videoResize(media) {
    const tempfile = tempFile("mp4");
    const stream = new Readable();
    const buffer = Buffer.from(
        media.data.replace(`data:${media.mimetype};base64,`, ''),
        'base64'
    );
    stream.push(buffer);
    stream.push(null);

    await new Promise((resolve, reject) => {
        ffmpeg(stream)
            .videoCodec('libx264')
            .size('512x512')
            .outputOptions(['-preset fast', '-movflags +faststart', '-pix_fmt yuv420p'])
            .noAudio()
            .save(tempfile)
            .on('error', reject)
            .on('end', resolve);
    });

    const data = await fs.readFile(tempfile, 'base64');
    await fs.unlink(tempfile);

    return data;
}
