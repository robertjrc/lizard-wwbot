import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "rebaixar",
    params: ["<@user>"],
    category: "moderação",
    desc: `
       Remove os privilégios de
        administrador do usuário
        especificado no grupo,
        retornando-o ao status
        de membro comum. 
    `,
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
                message: "Por favor, mencione o usuário que você deseja rebaixar."
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

        if (!member.isAdmin) {
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: "O usuário não é *admin*."
            }));
        }

        if (member.isSuperAdmin) {
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: "Não é possível rebaixar um *super admin*."
            }));
        }

        const groupId = chat.id._serialized;
        const memberId = member.id._serialized;

        const group = await client.getChatById(groupId);
        await group.demoteParticipants([memberId]);

        return await chat.sendMessage(msgResult("success", {
            title: "rebaixado",
            message: `@${member.id.user} foi rebaixado(a) a *membro comum*.`
        }), { mentions: [memberId] });
    }
}
