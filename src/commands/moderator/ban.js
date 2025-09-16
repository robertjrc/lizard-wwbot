import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "ban",
    params: ["<@user>"],
    category: "moderação",
    desc: "Remove permanentemente um usuário do grupo.",
    admin: true,
    async execute(msg, { client, chat }) {
        if (!(chat.participants.find(x => x.id._serialized === msg.to)).isAdmin) {
            return msg.reply(msgResult("alert", {
                title: "sem permissão",
                message: "Por favor, forneça acesso *admin* para o bot."
            }));
        }

        if (msg.mentionedIds.length < 1) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, mencione o usuário que você deseja banir."
            }));
        }

        const mentionedId = msg.mentionedIds[0];
        let member = chat.participants.find((x) => x.id._serialized === mentionedId);

        if (!member) {
            return msg.reply(msgResult("alert", {
                title: "membro não encontrado",
                message: "Por favor, forneça um usuário válido."
            }));
        }

        if (member.isAdmin) {
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: "Não é possível banir um *admin*."
            }));
        }

        const groupId = chat.id._serialized;
        const memberId = member.id._serialized;

        const chatId = await client.getChatById(groupId);
        await chatId.removeParticipants([memberId]);

        return await chat.sendMessage(msgResult("success", {
            title: "usário banido",
            message: `@${member.id.user} foi banido.`
        }), { mentions: [memberId] });
    }
}
