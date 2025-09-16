import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "desafixar",
    aliases: ["unpin"],
    category: "moderação",
    desc: `
        Remove a fixação da
        mensagem marcada no grupo.
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
                message: "Por favor, marque a mensagem que você deseja desafixar."
            }));
        }

        const quotedMsg = await msg.getQuotedMessage();
        await quotedMsg.unpin();

        return await chat.sendMessage(msgResult("success", {
            title: "contéudo desafixado",
            message: `Mensagem desafixada com sucesso.`
        }));
    }
}
