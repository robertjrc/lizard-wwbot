import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "desc",
    params: ["<text>"],
    category: "moderação",
    desc: `
        Atualiza a descrição do
        grupo com o texto informado.
    `.replace(/\s+/g, ' ').trim(),
    admin: true,
    async execute(msg, { client, chat, args }) {
        if (!(chat.participants.find(x => x.id._serialized === msg.to)).isAdmin) {
            return msg.reply(msgResult("alert", {
                title: "sem permissão",
                message: "Por favor, forneça acesso *admin* para o bot."
            }));
        }

        const charLimit = 2048;
        const groupId = chat.id._serialized;

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça a *descrição*."
            }));
        }

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        const group = await client.getChatById([groupId]);
        await group.setDescription(args);

        return await chat.sendMessage(msgResult("success", {
            title: "contéudo atualizado",
            message: "Descrição atualizada com sucesso."
        }));
    }
}
