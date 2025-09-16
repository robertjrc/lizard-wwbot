import { timeDuration } from "../../helpers/timeDuration.js";

export default {
    name: "uptime",
    category: "utilidade",
    desc: `
        Exibe há quanto tempo
        o bot está em execução
        desde a última inicialização.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg) {
        return await msg.reply(`*${timeDuration(global.uptime, "past")}*`);
    }
}
