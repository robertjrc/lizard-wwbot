import axios from "axios";
import { URL } from "node:url";
import { RNG } from "../utils/RNG.js";

const { yugioh_api } = await (await import("../utils/importJson.js")).importJson("src/data/URLs.json");

export class YugiohService {
    async getInfo() {
        function result(success, { message, data }) {
            return {
                success,
                data: data || null,
                message: message || null
            }
        }

        const url = new URL(yugioh_api);
        url.searchParams.append("language", "pt");

        try {
            const { data } = await axios.get(url.href);
            const card = data.data[RNG(data.data.length, 0)];

            return result(true, {
                data: {
                    name: card.name,
                    type: card.type,
                    atk: card.atk || null,
                    def: card.def || null,
                    level: card.level || null,
                    desc: card.desc,
                    img_url: card.card_images[0].image_url,
                },
                message: "Carta Yugioh encontrada com sucess."
            });
        } catch (error) {
            console.error(error);
            return result(false, { message: "erro ao obter a carta." });
        }
    }
}
