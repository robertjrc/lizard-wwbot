import { msgResult } from "../../utils/messageResult.js";
import { PopCatService } from "../../services/popCatService.js";

export default {
    name: "8ball",
    params: ["<question>"],
    category: "diversão",
    wait: true,
    desc: `
        Responde a uma pergunta
        de forma aleatória, no
        estilo “bola 8 mágica”,
        retornando previsões 
        positivas, negativas ou
        incertas.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { args }) {
        const charLimit = 100;

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, faça uma *pergunta*."
            }));
        }

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        const response = await (new PopCatService()).eightBall();

        if (!response.success) {
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        return await msg.reply(`🎱 ${response.data}`);
    }
}
