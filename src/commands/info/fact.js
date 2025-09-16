import { msgResult } from "../../utils/messageResult.js";
import { PopCatService } from "../../services/popCatService.js";

export default {
    name: "fato",
    category: "informação",
    wait: true,
    desc: "Retorna um fato aleatório",
    async execute(msg) {
        const response = await (new PopCatService()).fact();

        if (!response.success) {
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        return await msg.reply(response.data);
    }
}
