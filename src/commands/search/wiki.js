import { WikiService } from "../../services/wikipediaService.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "wiki",
    params: ["<search>"],
    category: "pesquisa",
    wait: true,
    desc: `
        Pesquisa um termo na Wikipédia e retorna
        um resumo com as principais informações encontradas.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { args }) {
        let text;
        let charLimit = 50;

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Nenhuma pesquisa foi passada."
            }));
        }

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        const response = await WikiService.search(args);

        if (!response.success) {
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        text = `${response.data.content}\n\n`
        text += `${response.data.url}`

        return await msg.reply(text, null, { linkPreview: true });
    }
}
