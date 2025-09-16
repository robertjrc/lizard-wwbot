export default {
    name: "unmute",
    category: "moderação",
    desc: `
        Reativa o chat do grupo,
        liberando novamente as
        mensagens para todos os membros.
    `.replace(/\s+/g, ' ').trim(),
    admin: true,
    async execute(_, { chat }) {
        await chat.setMessagesAdminsOnly(false);
        return await chat.sendMessage("✅ chat ativo.");
    }
}
