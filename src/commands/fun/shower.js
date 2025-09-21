import { msgResult } from "../../utils/messageResult.js";
import { PopCatService } from "../../services/popCatService.js";

export default {
    name: "chuveiro",
    category: "diversão",
    wait: true,
    desc: `
        Retorna um pensamento
        aleatório, inspirado
        naquelas reflexões
        inesperadas que surgem
        ao tomar banho.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg) {
        const response = await (new PopCatService()).showerThought();

        if (!response.success) {
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        return await msg.reply(`🤔 ${response.data}`);
    }
}
