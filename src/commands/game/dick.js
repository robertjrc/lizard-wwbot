import { DickGrowerService } from "../../services/dickerGrowerService.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "pinto",
    params: [
        "<crescer>",
        "<rank>",
        "<start>",
        "<stop>",
        "<reset>"
    ],
    category: "jogos",
    desc: `
        Aumenta o tamanho do “pinto”
        do usuário em centímetros 
        aleatórios e atualiza o ranking
        geral, onde os membros disputam
        quem tem o maior.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { client, chat, args }) {
        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça um parâmetro (ex: crescer, rank, start...)."
            }));
        }

        const groupId = chat.id._serialized.substring(0, 10);
        const userId = msg.author;

        const dick = new DickGrowerService(groupId, userId, chat, msg);

        switch (args) {
            case "crescer": await dick.grow(); break;
            case "rank": await dick.rank(); break;
            case "start": await dick.start(); break;
            case "stop": await dick.stop(); break
            case "reset": await dick.reset(client); break;
            default: break;
        }
    }
}
