import { YoutubeService } from "../../services/youtubeService.js";
import { msgResult } from "../../utils/messageResult.js";
import { numberAbbreviation } from "../../utils/helpers/numberAbbreviation.js";
import { timeDuration } from "../../utils/helpers/timeDuration.js";

export default {
    name: "yt",
    params: ["<name>", "<link>"],
    category: "pesquisa",
    wait: true,
    desc: "",
    async execute(msg, { args }) {
        const charLimit = 60;

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "O nome ou link da música não foi passado."
            }));
        }

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        const response = await (new YoutubeService().getInfo(args));
        if (!response.success) {
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        const videoProps = {
            title: response.data.title,
            author: response.data.author,
            thumb: response.data.thumb,
            songLength: response.data.songLength,
            views: response.data.views,
            url: response.data.url
        }

        let text = `CANAL:  *${videoProps.author}*\n`;
        text += `DURAÇÃO:  *${timeDuration((Date.now() + videoProps.songLength), "furute")}*\n`;
        text += `VIEWS:  *${numberAbbreviation(videoProps.views)}*\n`;
        text += `URL:  *${videoProps.url}*`;

        return await msg.reply(text, null, { linkPreview: true });
    }
}
