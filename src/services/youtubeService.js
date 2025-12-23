import ytstream from "yt-stream";
import { tempFile } from "../utils/tempFile.js";
import { spawn } from "child_process";

const storage = new Map();

export class YoutubeService {
    async dl(search, serialized) {
        function result(success, { isComplete, message, data }) {
            return {
                success,
                isComplete: isComplete || null,
                message: message || null,
                data: data || null
            }
        }

        let lengthLimit = 600000;

        try {
            const info = await this.getInfo(search);

            if (!info.success) {
                return result(false, { message: info.message });
            };

            if (info.data.songLength > lengthLimit) {
                return result(true, {
                    isComplete: false,
                    message: "A música selecionada excedeu o limite de *10 minutos*.",
                    data: {
                        title: info.data.title,
                        author: info.data.author,
                        thumb: info.data.thumb,
                        url: info.data.url,
                    }
                });
            }

            const nextplay = this.#nextPlay(serialized, info.data.songLength)
            if (!nextplay.success) {
                return result(false, { message: nextplay.message });
            }

            const urlTomp3 = (url) => new Promise(async (resolve, reject) => {
                const ytProcess = spawn("yt-dlp", [
                    "--get-url",
                    "-f", "bestaudio",
                    "--no-playlist",
                    url
                ]);

                ytProcess.stdout.on("data", data => {
                    const audioUrl = data.toString().trim();

                    const tempfile = tempFile("mp3");

                    spawn("ffmpeg", [
                        "-i", audioUrl, tempfile
                    ]).on("error", (err) => {
                        return reject(err);
                    }).on("exit", async () => {
                        return resolve(tempfile);
                    });
                });

                ytProcess.on('error', (err) => {
                    reject(`Erro ao iniciar yt-dlp: ${err.message}`);
                });
            });

            return result(true, {
                isComplete: true,
                data: {
                    title: info.data.title,
                    author: info.data.author,
                    thumb: info.data.thumb,
                    url: info.data.url,
                    tempfile: await urlTomp3(info.data.url)
                }
            });
        } catch (error) {
            console.error(error);
            return result(false, { message: "Erro ao fazer download da música." });
        }
    }

    async getInfo(target) {
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/);
        const idFilter = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([0-9A-Za-z_-]{11})/;
        const ytDomains = ["youtube", "youtu.be"];

        const result = (success, { message, data }) => {
            return {
                success,
                message: message || null,
                data: data || null
            }
        }

        if (isUrl.test(target)) {
            if (!ytDomains.some(x => target.includes(x))) {
                return result(false, { message: "Apenas link do YouTube." });
            }

            const match = target.match(idFilter);

            target = match ? `https://youtu.be/${match[0]}` : null;
        }

        try {
            const results = (await ytstream.search(target))[0];

            return result(true, {
                data: {
                    title: results.title,
                    url: results.url,
                    author: results.author,
                    songLength: results.length,
                    songLengthText: results.length_text,
                    views: results.views,
                    thumb: results.thumbnail
                }
            });
        } catch (error) {
            console.log(error);
            return result(false, { message: "Tente ser mais específico." });
        }
    }

    #nextPlay(userId, songLength) {
        function formatDate(timestamp) {
            const _date = new Date(timestamp);
            return _date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        }

        if (storage.has(userId)) {
            const userTime = storage.get(userId);

            if (userTime - Date.now() > 0) return {
                success: false,
                message: `Aguarde até às *${formatDate(userTime)}*, antes de baixar outro conteúdo.`
            }
            storage.delete(userId);
        }

        const date = new Date(Date.now() + songLength);
        date.setSeconds(0);

        storage.set(userId, date.getTime());

        return { success: true };
    }
}
