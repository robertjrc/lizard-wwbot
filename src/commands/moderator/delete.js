export default {
    name: "apagar",
    category: "moderação",
    desc: `
        Exclui a mensagem
        marcada do grupo.
    `.replace(/\s+/g, ' ').trim(),
    admin: true,
    async execute(msg) {
        if (!(chat.participants.find(x => x.id._serialized === msg.to)).isAdmin) {
            return msg.reply(msgResult("alert", {
                title: "sem permissão",
                message: "Por favor, forneça acesso *admin* para o bot."
            }));
        }

        if (!msg.hasQuotedMsg) {
            return msg.reply(msgResult("alert", {
                title: "sem conteúdo",
                message: "Por favor, marque a mensagem que você deseja apagar."
            }));
        }

        const quotedMsg = await msg.getQuotedMessage();

        return await quotedMsg.delete(true);
    }
}
