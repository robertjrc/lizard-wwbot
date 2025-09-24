import { PopCatService } from "../../services/popCatService.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "steam",
    params: ["<game>"],
    category: "pesquisa",
    wait: true,
    desc: `
        Retorna informações sobre um jogo na Steam,
        incluindo preço, descrição,
        tipo e link para o site oficial. 
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { args }) {
        const charLimit = 60;

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça o *nome* do jogo."
            }));
        }

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        const response = await (new PopCatService().steam(args));

        if (!response.success) {
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        const gameProps = {
            type: response.data.type,
            name: response.data.name,
            description: response.data.description,
            website: response.data.website,
            developers: response.data.developers,
            publishers: response.data.publishers,
            price: response.data.price
        }

        let text = `┏━━【 *${gameProps.name}* 】\n`;
        text += "┃\n";
        text += `┣ 🕹️ *Tipo*\n`;
        text += `┃  └ ${gameProps.type}\n`;
        text += "┃\n";
        text += `┣ 💵 *Preço*\n`;
        text += `┃  └ ${gameProps.price}\n`;
        text += "┃\n";
        text += `┣ 🛠️ *Desenvolvedores*\n`;
        gameProps.developers.forEach((dev, i) => {
            text += `┃ ${(i + 1 === gameProps.developers.length) ? " └ " + dev + "\n" : " ├ " + dev + "\n"}`;
        });
        text += "┃\n";
        text += `┣ 👥 *Editores*\n`;
        gameProps.publishers.forEach((publisher, i) => {
            text += `┃ ${(i + 1 === gameProps.publishers.length) ? " └ " + publisher + "\n" : " ├ " + publisher + "\n"}`;
        });
        text += "┃\n";
        text += `┣ 📜 *Descrição*\n`;
        text += `┃  └ ${gameProps.description}\n`;
        text += "┃\n";
        text += `┣ 🔗 ${gameProps.website}\n`;
        text += "┃\n";
        text += "┗━━";

        return await msg.reply(text, null, { linkPreview: true });
    }
}
