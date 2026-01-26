import { MessageMedia } from "../../lib/wwbotjs.js";
import { imgToWebp } from "../../helpers/imgToWebp.js"
import { videoResize } from "../../helpers/videoResize.js";
import { msgResult } from "../../utils/messageResult.js";
import { RNG } from "../../utils/RNG.js";
import { importJson } from "../../utils/importJson.js";

export default {
    name: "sticker",
    aliases: ["s", "fig"],
    params: ["<default>"],
    category: "mídia",
    desc: "Cria figurinhas personalizadas a partir de imagens, vídeos ou GIFs.",
    async execute(msg, { args }) {
        const stickerMsg = await importJson("src/data/stickerMessages.json");
        const { nickname } = await importJson("src/config/bot.json");
        const authorNickname = msg._data.notifyName;
        const MediaType = {
            image: { mimetype: 'image/webp', filename: `${Date.now()}.webp` },
            video: { mimetype: 'video/mp4', filename: `${Date.now()}.mp4` }
        }
        let type;
        let media;
        let songsLimite = 10;
        let formatScale = (args && args.toLowerCase() === "default") ? "contain" : "cover"

        let content = (msg.hasQuotedMsg) ? await msg.getQuotedMessage() : msg;

        if (!content.hasMedia) return;
        if (content.type !== 'image' && content.type !== 'video') return;
        if (content.type === 'video' && Number(content._data.duration) > songsLimite) {
            return msg.reply(msgResult("alert", {
                title: "limite de duração",
                message: `O *vídeo/gif* deve ter no máximo *${songsLimite}s* de duração.`
            }));
        };

        if (content.type === "video") await msg.reply(stickerMsg[RNG(stickerMsg.length, 0)]);

        const { data } = await content.downloadMedia();

        type = MediaType[content.type];

        let stickerProps = {
            mimetype: type.mimetype,
            data: (type.mimetype.split("/")[0] === 'image')
                ? (await imgToWebp(data, formatScale))
                : (formatScale === "cover") ? await videoResize(new MessageMedia(type.mimetype, data, type.filename)) : data,
            filename: type.filename
        };

        media = new MessageMedia(stickerProps.mimetype, stickerProps.data.toString("base64"), stickerProps.filename);

        return await msg.reply(media, null, {
            sendMediaAsSticker: true,
            stickerName: authorNickname,
            stickerAuthor: nickname
        });
    }
}
