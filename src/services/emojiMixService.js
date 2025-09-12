import axios from "axios";
import { URL } from "node:url";

const { emoji_mix_api } = await (await import("../utils/importJson.js")).importJson("src/data/URLs.json");

export class EmojiMixService {
    static async mix(emoji01, emoji02) {
        function result(success, { message, data }) {
            return {
                success,
                data: data || null,
                message: message || null
            }
        }

        const url = new URL(emoji_mix_api);

        url.searchParams.append("key", process.env.EMOJIMIX_API_KEY);
        url.searchParams.append("contentfilter", "high");
        url.searchParams.append("media_filter", "png_transparent");
        url.searchParams.append("component", "proactive");
        url.searchParams.append("collection", "emoji_kitchen_v5"); 
        url.searchParams.append("q", `${emoji01}_${emoji02}`);

        try {
            const { status, data } = await axios.get(url.href);

            if (status !== 200) {
                return result(false, {
                    message: "Erro ao mixar."
                });
            }

            if (data.results.length == 0) {
                return result(false, {
                    message: "Emojis inválidos."
                });
            }

            return result(true, {
                data: {
                    img_url: data.results[0].media_formats.png_transparent.url
                },
                message: "Emojis mixado com sucesso."
            });
        } catch (error) {
            console.error(error);
            return result(false, {
                message: "Erro ao tentar mixar os emojis."
            });
        }
    }
}
