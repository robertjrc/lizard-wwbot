import { MessageMedia } from "../../lib/wwbotjs.js";

export default {
    name: "toimg",
    category: "mídia",
    desc: "Converte um sticker em imagem no formato padrão.",
    async execute(msg) {
        try {
            if (!msg.hasQuotedMsg) {
                return msg.reply(msgResult("alert", {
                    title: "sem sticker",
                    message: "Por favor, marque o sticker que você deseja converter para imagem."
                }));
            }

            const quotedMessage = await msg.getQuotedMessage();
            if (!quotedMessage.hasMedia && quotedMessage.type !== 'sticker') return;
            if (quotedMessage._data.isViewOnce) return;

            const { data } = await quotedMessage.downloadMedia();

            const media = new MessageMedia('image/jpeg', data.toString('base64'), `${Date.now()}.jpeg`);

            return await msg.reply(media, null, { sendMediaAsDocument: false });
        } catch (error) {
            return msg.reply(msgResult("alert", {
                title: "não foi possível",
                message: "não foi possível converter."
            }));
        }
    }
}

