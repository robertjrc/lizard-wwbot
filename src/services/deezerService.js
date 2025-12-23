import { URL } from "node:url";
import axios from "axios";
import { importJson } from "../utils/importJson.js";
import { timeDuration } from "../helpers/timeDuration.js";

const storage = new Map();

export class DeezerService {
    async search(song, userId) {
        const wait = this.#wait(userId)
        if (!wait.success) return { success: false, message: wait.message };

        const { deezer_api } = await importJson("src/data/URLs.json");

        const url = new URL(deezer_api);

        url.pathname = "/search/track";
        url.searchParams.append("q", song);
        url.searchParams.append("limit", 1);

        try {
            const { data } = await axios.get(url.href);

            return {
                success: true,
                data
            }
        } catch (error) {
            console.error(error.data);

            return { success: false, message: "Erro ao tentar buscar a música." }
        }
    }

    #wait(userId) {
        const limitInSeconds = 30000;

        if (storage.has(userId)) {
            const userTime = storage.get(userId);

            if (userTime - Date.now() > 0) return {
                success: false,
                message: `Aguarde *${timeDuration(userTime, "future")}*, antes de fazer outra pesquisa.`
            }
            storage.delete(userId);
        }

        const date = new Date(Date.now() + limitInSeconds);

        storage.set(userId, date.getTime());

        return { success: true };
    }
}
