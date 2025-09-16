import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "subject",
    params: ["<text>"],
    category: "moderação",
    desc: `
        Atualiza o assunto/título do
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

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça o *nome*."
            }));
        }

        const charLimit = 100;

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        const groupId = chat.id._serialized;
        const group = await client.getChatById([groupId]);
        await group.setSubject(args);

        return await chat.sendMessage(msgResult("success", {
            title: "contéudo atualizado",
            message: "Assunto atualizado com sucesso."
        }));
    }
}
