import { importJson } from "../../utils/importJson.js";
import { msgResult } from "../../utils/messageResult.js";
import { RNG } from "../../utils/RNG.js";

export default {
    name: "nível",
    params: ["<feio>", "<options>"],
    category: "diversão",
    desc: `
        Avalia o nível de uma
        qualidade específica
        (exemplo: “noia”, “rico”, “lindo”)
        e retorna um diagnóstico
        divertido baseado no resultado.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { args }) {
        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça um parâmetro (ex: options...)."
            }));
        }

        const levels = await importJson("src/data/levels.json");

        if (args === "options") {
            let text = `┏━━【 *Optções disponíveis* 】(${levels.length})\n`;
            text += "┃\n";

            for (let i = 0; i < levels.length; i++) {
                text += `┣ ${levels[i].name}\n`;
            }

            text += "┃\n";
            text += "┗━━";

            return await msg.reply(text);
        }

        const level = levels.find(x => x.name === args.toLowerCase());
        if (!level) return;

        let result = RNG(101, 0);
        let user = (msg.hasQuotedMsg) ? (await msg.getQuotedMessage()).id.participant._serialized : msg.author;
        let text = "*Avaliação oficial*\n\n";
        text += `*Usuário:* @${user.split("@")[0]}\n`;
        text += `*Tipo de exame:* nível de ${level.type.toUpperCase()} ${level.emoji}\n`;
        text += `*Resultado:* ${result}% 🧪\n\n`;

        const index = result >= 90 ? 0 : result >= 70 ? 1 : result >= 40 ? 2 : 3;

        text += `*Diagnostico:* ${level.diagnosis[index]}`;

        return await msg.reply(text, null, { mentions: [user] });
    }
}
