import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "everyone",
    aliases: ["todos"],
    category: "moderação",
    desc: `
        Menciona todos os membros do
        grupo em uma mensagem marcada.
    `.replace(/\s+/g, ' ').trim(),
    admin: true,
    async execute(msg, { chat }) {
        let members = [];
        let text = "> @everyone\n\n";

        for (let participants of chat.participants) {
            members.push(participants.id._serialized);
        }

        if (!msg.hasQuotedMsg) {
            return await msg.reply(msgResult("alert", {
                title: "sem conteúdo",
                message: "Marque a mensagem que você deseja mencionar todos!"
            }));
        }

        const quotedMsg = await msg.getQuotedMessage();

        text += `🚨 *ATENÇÃO!* Você foi mencionado por outro membro. Por favor, verifique a mensagem e responda se necessário.\n\n`;
        text += `autor: *@${msg.author.split("@")[0]}*\n`;
        text += `membros: *${members.length}*`;

        return await quotedMsg.reply(text, null, { mentions: members });
    }
}
