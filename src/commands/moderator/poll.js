import { Poll } from "../../lib/wwbotjs.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "enquete",
    params: ["<title [option,...]>"],
    aliases: ["poll"],
    category: "moderação",
    desc: `
        Cria uma enquete no
        grupo com o título
        informado e as opções
        fornecidas (exemplo: Meu
        título [Opção1, Opção2]). 
    `.replace(/\s+/g, ' ').trim(),
    admin: true,
    async execute(msg, { chat, args }) {
        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça o título e as opções da enquete (ex: title [option1, option2])."
            }));
        }

        const match = args.match(/^(.*?)\s*\[(.*?)\]$/);

        if (!match) {
            return msg.reply(msgResult("alert", {
                title: "parâmetro inválido",
                message: "Por favor, forneça um parâmetro válido."
            }));
        };

        const pollName = match[1].trim();
        const pollOptions = match[2].split(",").map(o => o.trim());

        const pollNameCharLimit = 500;
        const maxOptions = 12;
        const minOptions = 2;
        const charLimitByOption = 100;

        if (pollName.length > pollNameCharLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${pollNameCharLimit}* caracteres para o título.`
            }));
        }

        if (pollOptions.length < minOptions) {
            return msg.reply(msgResult("alert", {
                title: "opções mínima",
                message: `Mímino de *${minOptions}* opções.`
            }));
        }

        if (pollOptions.length > maxOptions) {
            return msg.reply(msgResult("alert", {
                title: "opções máxima",
                message: `Máximo de *${maxOptions}* opções.`
            }));
        }

        for (let i = 0; i < pollOptions.length; i++) {
            if (pollOptions[i].length > charLimitByOption) {
                return msg.reply(msgResult("alert", {
                    title: "limite de caracteres",
                    message: `Máximo de *${pollNameCharLimit}* caracteres por opção.`
                }));
            }
        }

        return await chat.sendMessage(new Poll(pollName, pollOptions));
    }
}
