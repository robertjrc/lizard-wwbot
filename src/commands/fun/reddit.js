import axios from "axios";
import { URL } from "node:url";
import { importJson } from "../../utils/importJson.js";
import { RNG } from "../../utils/RNG.js";
import { msgResult } from "../../utils/messageResult.js";
import { MessageMedia } from "../../lib/wwbotjs.js";

export default {
    name: "reddit",
    category: "diversão",
    wait: true,
    desc: "Retorna uma imagem aleatória de um subreddit.",
    async execute(msg) {
        const { reddit_api } = await importJson("src/data/URLs.json");
        const url = new URL(reddit_api);

        const subreddits = ["ShitpostBR", "BrazilianShitpost", "BRshitpost"];

        url.pathname += `/${subreddits[RNG(subreddits.length, 0)]}`;

        try {
            const { data } = await axios.get(url.href);

            const redditProps = {
                title: data.title,
                subreddit: data.subreddit,
                postlink: data.postLink,
                img_url: data.url,
            }

            let text = `*${redditProps.title}*\n`;
            text += `${redditProps.subreddit}\n\n`;
            text += `${redditProps.postlink}`;

            return await msg.reply(
                await MessageMedia.fromUrl(redditProps.img_url),
                null,
                { caption: text });
        } catch (_) {
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: "Não possível obter o subreddit." 
            }));
        }
    }
}
