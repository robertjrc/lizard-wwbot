import { MessageMedia } from "../../lib/wwbotjs.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "icon",
    category: "moderação",
    desc: `
        Atualiza a imagem do grupo
        utilizando a mídia informada.
    `.replace(/\s+/g, ' ').trim(),
    admin: true,
    async execute(msg, { chat }) {
        if (!(chat.participants.find(x => x.id._serialized === msg.to)).isAdmin) {
            return msg.reply(msgResult("alert", {
                title: "sem permissão",
                message: "Por favor, forneça acesso *admin* para o bot."
            }));
        }

        if (!msg.hasQuotedMsg) {
            return msg.reply(msgResult("alert", {
                title: "sem conteúdo",
                message: "Por favor, marque a imagem que você deseja definir."
            }));
        }

        const quotedMsg = await msg.getQuotedMessage();

        if (!quotedMsg.hasMedia && msg.type !== "image") {
            return await msg.reply(msgResult("error", {
                title: "não possível",
                message: "O conteúdo marcado não é válido."
            }));
        }

        const { data } = await quotedMsg.downloadMedia();
        const media = new MessageMedia('image/jpeg', data.toString('base64'), `${Date.now()}.jpeg`);

        await chat.setPicture(media);

        return await chat.sendMessage(msgResult("success", {
            title: "contéudo atualizado",
            message: "Imagem atualizada com sucesso."
        }));
    }
}
