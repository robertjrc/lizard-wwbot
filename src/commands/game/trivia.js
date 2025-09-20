import { TriviaService } from "../../services/triviaService.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "trivia",
    params: ["<start>", "<stop>", "<reset>"],
    category: "jogos",
    desc: `
        Inicia um jogo de perguntas
        e respostas com mais de 200
        questões aleatórias. Cada 
        rodada apresenta uma pergunta.
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

        const trivia = new TriviaService(groupId, userId, chat, msg);

        switch (args) {
            case "start": await trivia.start(); break
            case "stop": await trivia.stop(); break
            case "reset": await trivia.reset(client); break
            default: await trivia.run(args, client); break;
        }
    }
}
