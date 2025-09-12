import { EmojiMixService } from "../../services/emojiMixService.js";
import { MessageMedia } from "../../lib/wwbotjs.js";
import { msgResult } from "../../utils/messageResult.js";

const { nickname } = await (await import("../../utils/importJson.js")).importJson("src/config/bot.json");

export default {
    name: "emojimix",
    params: ["<😄+😍>"],
    category: "diversão",
    desc: "Combina dois emojis em uma única imagem gerando uma versão mesclada.",
    async execute(msg, { args }) {
        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça os emoji (ex: 😄+😍)."
            }));
        }

        if (!args.includes("+")) {
            return msg.reply(msgResult("alert", {
                title: "formato inválido",
                message: "Por favor, adicione *+* entre os emojis (ex: 😄+😍)."
            }));
        }

        const isEmoji = new RegExp("(\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])");
        const emojis = args.split("+");

        if (!emojis[0]) {
            return msg.reply(msgResult("alert", {
                title: "sem valor",
                message: "Por favor, forneça o primeiro emoji."
            }));
        }

        if (!emojis[1]) {
            return msg.reply(msgResult("alert", {
                title: "sem valor",
                message: "Por favor, forneça o segundo emoji."
            }));
        }

        const emoji01 = emojis[0];
        const emoji02 = emojis[1];

        if (!isEmoji.test(emoji01)) {
            return msg.reply(msgResult("alert", {
                title: "emoji inválido",
                message: "O *1°* valor não é um emoji válido para mix."
            }));
        }

        if (!isEmoji.test(emoji02)) {
            return msg.reply(msgResult("alert", {
                title: "emoji inválido",
                message: "O *2°* valor não é um emoji válido para mix."
            }));
        }

        const response = await EmojiMixService.mix(emoji01, emoji02);

        if (!response.success) {
            return msg.reply(msgResult("alert", {
                title: "não foi possível",
                message: response.message
            }));
        }

        return await msg.reply(
            await MessageMedia.fromUrl(response.data.img_url),
            null,
            {
                sendMediaAsSticker: true,
                stickerName: msg._data.notifyName,
                stickerAuthor: nickname
            }
        );
    }
}
