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

        const latency = end - start;

        await new Promise(resolve => setTimeout(resolve, 500));

        return await sent.edit(`🏓 Pong!\n\n📡 Latência: *${latency}ms*`);
    }
}
