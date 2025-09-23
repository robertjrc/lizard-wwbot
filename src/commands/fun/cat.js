import axios from "axios";
import { URL } from "node:url";
import { importJson } from "../../utils/importJson.js";
import { RNG } from "../../utils/RNG.js";
import { msgResult } from "../../utils/messageResult.js";
import { MessageMedia } from "../../lib/wwbotjs.js";

export default {
    name: "gato",
    category: "diversão",
    wait: true,
    desc: `
        Retorna uma imagem 
        de um gato aleatório.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg) {
        const { reddit_api } = await importJson("src/data/URLs.json");
        const url = new URL(reddit_api);

        const subreddits = [
            "cats",
            "catpics",
            "CatsStandingUp",
            "blackcats"
        ];

        url.pathname += `/${subreddits[RNG(subreddits.length, 0)]}`;

        try {
            const { data } = await axios.get(url.href);

            const memeProps = {
                img_url: data.url,
            }

            return await msg.reply(await MessageMedia.fromUrl(memeProps.img_url));
        } catch (error) {
            console.log(error);
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: "Não possível obter a imagem do gato."
            }));
        }
    }
}
