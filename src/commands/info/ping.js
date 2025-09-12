export default {
    name: "ping",
    category: "informação",
    desc: "Exibe a latência atual do bot em milissegundos, útil para verificar a responsividade da conexão.",
    async execute(msg) {
        const start = Date.now();
        const sent = await msg.reply(`🔄 Processando...`);
        const end = Date.now();

        let text = "🏓 Pong!\n\n";
        text += `📡 Ping: *${end - start}ms*\n`;
        text += `⌛ Mensagem: *${Date.now() - (msg.timestamp * 1000)}ms*`;

        await new Promise(resolve => setTimeout(resolve, 500));

        return await sent.edit(text);
    }
}
