import axios from "axios";
import { msgResult } from "../../utils/messageResult.js";
import { importJson } from "../../utils/importJson.js";
import { PopCatService } from "../../services/popCatService.js";

export default {
    name: "conselho",
    category: "informação",
    wait: true,
    desc: "Retorna um conselho aleatório.",
    async execute(msg) {
        const { advice_api } = await importJson("src/data/URLs.json");

        try {
            const { data } = await axios(advice_api);

            return await msg.reply(await (new PopCatService().translate(data.slip.advice, "pt")));
        } catch (error) {
            console.error(error);
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: "Não foi possível obter o conselho."
            }));
        }
    }
}
