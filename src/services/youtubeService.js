import ytstream from "yt-stream";
import { tempFile } from "../utils/tempFile.js";
import { spawn } from "child_process";
import ytdl from "@distube/ytdl-core";

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
                const audioUrl = ytdl.filterFormats((await ytdl.getInfo(url)).formats, "audioonly")[0].url;
                const tempfile = tempFile("mp3");

                spawn("ffmpeg", [
                    "-i", audioUrl, tempfile
                ]).on("error", (err) => {
                    return reject(err)
                }).on("exit", async () => {
                    return resolve(tempfile);
                })
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
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/)
        function result(success, { message, data }) {
            return {
                success,
                message: message || null,
                data: data || null
            }
        }

        const ytDomains = ["youtube", "youtu.be"]
        if (isUrl.test(target)) if (!ytDomains.some(x => target.includes(x))) {
            return result(false, { message: "Apenas link do YouTube." });
        }

        try {
            const results = await ytstream.search(target)

            return result(true, {
                data: {
                    title: results[0].title,
                    url: results[0].url,
                    author: results[0].author,
                    songLength: results[0].length,
                    songLengthText: results[0].length_text,
                    views: results[0].views,
                    thumb: results[0].thumbnail
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
                message: `Você só poderá pedir música novamente às *${formatDate(userTime)}*, devido a solicitação anterior.`
            }
            storage.delete(userId);
        }

        storage.set(userId, Date.now() + songLength);
        return { success: true };
    }
}
