import { RNG } from "../../utils/RNG.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "chance",
    params: ["<context>"],
    category: "diversão",
    desc: `
        Retorna uma porcentagem
        aleatória relacionada ao
        contexto informado.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { args }) {
        const charLimit = 100;

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça um *contexto*."
            }));
        }

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        let text = `A chance *${args}*\n\n`;
        text += `é de... *${RNG(101, 0)}%*`

        return await msg.reply(text);
    }
}
