import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import { tempFile } from "../utils/tempFile.js";
import fs from "node:fs/promises";
import { importJson } from "../utils/importJson.js";

const { ffmpeg_path } = await importJson("src/config/settings.json");

ffmpeg.setFfmpegPath(ffmpeg_path);

export async function setAuidoFilter(media, filter) {
    const tempfile = tempFile("mp3");
    const stream = new Readable();
    const buffer = Buffer.from(
        media.data.replace(`data:${media.mimetype};base64,`, ''),
        'base64'
    );
    stream.push(buffer);
    stream.push(null);

    await new Promise((resolve, reject) => {
        ffmpeg(stream)
            .audioFilter(filter)
            .save(tempfile)
            .on('error', (error) => {
                reject(error);
            })
            .on('end', resolve);
    });

    const data = await fs.readFile(tempfile, 'base64');
    await fs.unlink(tempfile);

    return data;
}
