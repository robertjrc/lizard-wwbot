import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import { tempFile } from "../utils/tempFile.js";
import fs from "node:fs/promises";
import { importJson } from "../utils/importJson.js";

const { ffmpeg_path } = await importJson("src/config/settings.json");

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
            .fps(20)
            .videoFilters([
                "scale=w='min(512,iw*(512/min(iw,ih)))':h='min(512,ih*(512/min(iw,ih)))':force_original_aspect_ratio=increase",
                "crop=512:512:(in_w-out_w)/2:(in_h-out_h)/2"
            ])
            .outputOptions([
                '-preset veryfast',
                '-crf 28',
                '-maxrate 1M',
                '-bufsize 2M',
                '-movflags +faststart',
                '-pix_fmt yuv420p'
            ])
            .noAudio()
            .format('mp4')
            .save(tempfile)
            .on('error', reject)
            .on('end', resolve);
    });

    const data = await fs.readFile(tempfile, 'base64');
    await fs.unlink(tempfile);

    return data;
}
