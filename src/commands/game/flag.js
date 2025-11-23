import { FlagService } from "../../services/flagService.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "flag",
    params: ["<start>", "<stop>", "<reset>"],
    category: "jogos",
    desc: `
        Inicia um jogo de adivinhação
        de bandeiras. O bot exibe uma
        bandeira aleatória e o jogador
        deve tentar adivinhar digitando
        a resposta (exemplo: !flag A).
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { client, chat, args }) {
        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça um parâmetro (ex: start, stop, reset, ou uma resposta: <A>)."
            }));
        }

        const groupId = chat.id._serialized.substring(0, 10);
        const userId = msg.author;

        const flag = new FlagService(groupId, userId, chat, msg);

        switch (args) {
            case "start": await flag.start(client); break
            case "stop": await flag.stop(client); break
            case "reset": await flag.reset(client); break
            default: await flag.run(args, client); break;
        }
    }
}
