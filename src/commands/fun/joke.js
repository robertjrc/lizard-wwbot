import axios from "axios";
import { URL } from "node:url";
import { translate } from "../../utils/translate.js";
import { msgResult } from "../../utils/messageResult.js";
import { importJson } from "../../utils/importJson.js";

export default {
    name: "piada",
    category: "diversão",
    desc: "Retorna uma piada aleatória.",
    async execute(msg) {
        const { popcat_api } = await importJson("../../data/URLs.json");

        const url = new URL(popcat_api);
        url.pathname = "/joke";

        const { status, data } = await axios.get(url.href);

        if (status !== 200) {
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: "Não foi possível obter a piada."
            }));
        }

        return await msg.reply(await translate(data.joke, "pt"));
    }
}
