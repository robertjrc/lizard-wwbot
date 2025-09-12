import { MessageMedia } from "../../lib/wwbotjs.js";
import { unlinkSync, readFileSync } from "node:fs";
import { YoutubeService } from "../../services/youtubeService.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "play",
    params: ["<name>", "<url>"],
    category: "mídia",
    wait: true,
    desc: "Baixa músicas a partir do YouTube.",
    async execute(msg, { args }) {
        const charLimit = 60;

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça o *nome* ou *URL* da música."
            }));
        }

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        const response = await (new YoutubeService().dl(args, msg.author));

        if (!response.success) {
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        if (!response.isComplete) {
            const media = await MessageMedia.fromUrl(response.data.thumb);
            await msg.reply(media, null, {
                caption: `*${response.data.title}*\n${response.data.author}\n\n${response.data.url}`
            })
            return await msg.reply(response.message);
        }

        const songProps = {
            title: response.data.title,
            author: response.data.author,
            thumb: response.data.thumb,
            url: response.data.url,
            mp3: response.data.tempfile
        }

        const imageMedia = await MessageMedia.fromUrl(songProps.thumb);
        const audioMedia = new MessageMedia("audio/mp3", readFileSync(songProps.mp3, 'base64'), `${Date.now()}.mp3`);

        await msg.reply(imageMedia, null, {
            caption: `*${songProps.title}*\n${songProps.author}\n\n${songProps.url}`
        });

        await msg.reply(audioMedia);
        return unlinkSync(songProps.mp3);
    }
}
