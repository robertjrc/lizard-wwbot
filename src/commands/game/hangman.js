import { HangmanGameService } from "../../services/hangmanGameService.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "forca",
    params: ["<start>", "<stop>", "<reset>"],
    category: "jogos",
    desc: `
        Inicia uma partida do
        clássico jogo da forca.
        O bot sorteia uma palavra
        e os jogadores devem tentar
        adivinhar as letras antes
        que o boneco seja completo.
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

        const hangman = new HangmanGameService(groupId, userId, chat, msg);

        switch (args) {
            case "start": await hangman.start(); break
            case "stop": await hangman.stop(); break
            case "reset": await hangman.reset(client); break
            default: await hangman.run(args, client); break;
        }
    }
}
