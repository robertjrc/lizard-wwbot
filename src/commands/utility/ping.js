export default {
    name: "ping",
    category: "utilidade",
    desc: `
        Exibe a latência atual do
        bot em milissegundos,
        útil para verificar a
        responsividade da conexão.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg) {
        const start = Date.now();
        const sent = await msg.reply(`🔄 Processando...`);
        const end = Date.now();

        let text = "🏓 Pong!\n\n";
        text += `📡 Ping: *${end - start}ms*\n`;
        text += `⌛ Latência: *${Date.now() - (msg.timestamp * 1000)}ms*`;

        await new Promise(resolve => setTimeout(resolve, 500));

        return await sent.edit(text);
    }
}
