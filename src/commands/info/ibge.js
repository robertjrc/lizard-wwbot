import { URL } from "node:url";
import { importJson } from "../../utils/importJson.js";
import axios from "axios";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "ibge",
    params: ["<page>"],
    category: "informação",
    desc: `
        Retorna dados estatísticos 
        do IBGE referentes à página
        informada. Caso não seja
        especificado um número, retorna
        a primeira página por padrão.
    `.replace(/\s+/g, ' ').trim(),
    wait: true,
    async execute(msg, { args }) {
        const page = (!args) ? 1 : Number(args);
        const pageLimit = 20;

        if (page > pageLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de página",
                message: `Máximo de *${pageLimit}* página.`
            }));
        }

        const { ibge_api } = await importJson("src/data/URLs.json");
        const url = new URL(ibge_api);

        url.searchParams.append("qtd", page);

        try {
            const { data } = await axios.get(url.href);

            const news = data.items[page - 1];

            const newProps = {
                intro: news.introducao,
                published: news.data_publicacao,
                url: news.link
            }

            let text = `${newProps.intro}\n\n`;
            text += `🗓️ *${newProps.published.split(" ")[0]}*\n`;
            text += `🕣 *${newProps.published.split(" ")[1]}*\n\n`
            text += `${newProps.url}`;

            await msg.reply(text, null, { linkPreview: true });
        } catch (error) {
            console.error(error);
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: "Não foi possível obter a notícia."
            }));
        }
    }
}
