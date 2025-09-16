import axios from "axios";
import { URL } from "node:url";
import { importJson } from "../../utils/importJson.js"
import { msgResult } from "../../utils/messageResult.js"

export default {
    name: "cot",
    params: ["<USD-BRL>", "<coins>"],
    category: "informação",
    wait: true,
    desc: "Retorna informações de cotação de moedas em tempo real",
    async execute(msg, { args }) {
        const { awesome_api } = await importJson("src/data/URLs.json");
        const url = new URL(awesome_api);
        let text;

        if (args === "coins") {
            text = `┌──⊣〔 *Moedas disponíveis* 〕\n`;
            text += "│\n";

            url.pathname = "/json/available/uniq";
            const { data } = await axios.get(url.href);

            for (let key in data) {
                text += `├ *${key}:* ${data[key]}\n`;
            }
            text += "│\n";
            text += "└─⊣";

            return await msg.reply(text);
        }

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça as moedas (ex: USD-BRL)."
            }));
        }

        if (!args.includes("-")) {
            return msg.reply(msgResult("alert", {
                title: "formato inválido",
                message: "Por favor, adicione *-* entre as moedas (ex: USD-BRL)."
            }));
        }

        url.pathname = `/last/${args}`;

        try {
            const { data } = await axios(url.href);
            const result = data[args.replace("-", "").toUpperCase()];

            let priceProps = {
                label: result.name,
                buy: result.bid,
                sale: result.ask,
                max: result.high,
                min: result.low,
                variation: result.varBid,
                variationPercent: result.pctChange,
                updatedAt: result.create_date
            }

            text = `┌──⊣〔 *${priceProps.label}* 〕\n`;
            text += "│\n";
            text += `├ 🛒 *Compra*\n`;
            text += `│  └ $${Number(priceProps.buy).toFixed(2).replace(".", ",")}\n`;
            text += "│\n";
            text += `├ 💸 *Venda*\n`;
            text += `│  └ $${Number(priceProps.sale).toFixed(2).replace(".", ",")}\n`;
            text += "│\n";
            text += `├ 📈 *Máximo*\n`;
            text += `│  └ $${Number(priceProps.max).toFixed(2).replace(".", ",")}\n`;
            text += "│\n";
            text += `├ 📉 *Mínimo*\n`;
            text += `│  └ $${Number(priceProps.min).toFixed(2).replace(".", ",")}\n`;
            text += "│\n";
            text += `├ 📊 *Variação*\n`;
            text += `│  └ ${priceProps.variation}\n`;
            text += "│\n";
            text += `├ ‼️ *Porcentagem de variação*\n`;
            text += `│  └ ${priceProps.variationPercent}%\n`;
            text += "│\n";
            text += `├ 🕣 *Última atualização*\n`;
            text += `│  └ ${new Date(priceProps.updatedAt).toLocaleString("pt-BR", { dateStyle: "medium", hourCycle: "h24" })}\n`;
            text += "│\n";
            text += "└──⊣";

            return await msg.reply(text);
        } catch (error) {
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: error.response.data.message
            }));
        }
    }
}
