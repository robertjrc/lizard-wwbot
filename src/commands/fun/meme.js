import axios from "axios";
import { URL } from "node:url";
import { importJson } from "../../utils/importJson.js";
import { RNG } from "../../utils/RNG.js";
import { msgResult } from "../../utils/messageResult.js";
import { MessageMedia } from "../../lib/wwbotjs.js";

export default {
    name: "meme",
    category: "diversão",
    wait: true,
    desc: `
        Retorna uma imagem 
        de um meme aleatório
        a partir de um subreddit.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg) {
        const { reddit_api } = await importJson("src/data/URLs.json");
        const url = new URL(reddit_api);

        const subreddits = [
            "ShitpostBR",
            "BrazilianShitpost",
            "BRshitpost",
            "MemesBR"
        ];

        url.pathname += `/${subreddits[RNG(subreddits.length, 0)]}`;

        try {
            const { data } = await axios.get(url.href);

            const memeProps = {
                title: data.title,
                subreddit: data.subreddit,
                postlink: data.postLink,
                img_url: data.url,
            }

            let text = `*${memeProps.title}*\n`;
            text += `${memeProps.subreddit}\n\n`;
            text += `${memeProps.postlink}`;

            return await msg.reply(
                await MessageMedia.fromUrl(memeProps.img_url),
                null,
                { caption: text });
        } catch (error) {
            console.log(error);
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: "Não possível obter o meme."
            }));
        }
    }
}
