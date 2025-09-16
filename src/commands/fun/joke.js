import { msgResult } from "../../utils/messageResult.js";
import { PopCatService } from "../../services/popCatService.js";

export default {
    name: "piada",
    category: "diversão",
    wait: true,
    desc: "Retorna uma piada aleatória.",
    async execute(msg) {
        const response = await (new PopCatService()).joke();

        if (!response.success) {
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        return await msg.reply(response.data);
    }
}
