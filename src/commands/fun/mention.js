import { RNG } from "../../utils/RNG.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "mencionar",
    params: ["<context>"],
    category: "diversão",
    desc: `
        Seleciona e menciona
        aleatoriamente
        um membro do servidor
        com base no
        contexto informado.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { chat, args }) {
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

        const size = chat.participants.length;
        const memberRand = (chat.participants[RNG(size, 0)]).id.user;

        let text = "Ok!\n\n";
        text += `Aqui está *${args}*: @${memberRand}`;

        return await msg.reply(text, null, { mentions: [`${memberRand}@c.us`] });
    }
}
