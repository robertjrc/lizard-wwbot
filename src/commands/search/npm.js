import { numberAbbreviation } from "../../helpers/numberAbbreviation.js";
import { PopCatService } from "../../services/popCatService.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "npm",
    params: ["<package>"],
    category: "pesquisa",
    wait: true,
    desc: `
        Busca informações sobre um pacote do npm e
        retorna detalhes como versão atual,
        descrição, autor, data da última atualização
        e link para a página oficial.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { args }) {
        const charLimit = 60;

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça o *nome* do pacote NPM."
            }));
        }

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        const response = await (new PopCatService().npm(args));

        if (!response.success) {
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        const packageProps = {
            name: response.data.name,
            version: response.data.version,
            description: response.data.description,
            author: response.data.author,
            last_published: response.data.last_published,
            repository: response.data.repository,
            downloads_this_year: response.data.downloads_this_year
        }


        let text = `┌──⊣〔 *${packageProps.name}* 〕v${packageProps.version}\n`;
        text += "│\n";
        text += `├ 👤 *Author*\n`;
        text += `│  └ ${packageProps.author}\n`;
        text += "│\n";
        text += `├ 🗓️ *Última publicação*\n`;
        text += `│  └ ${new Date(packageProps.last_published).toLocaleString("pt-BR", { dateStyle: "medium" })}\n`;
        text += "│\n";
        text += `├ 📥 *Baixado este ano*\n`;
        text += `│  └ ${numberAbbreviation(Number(packageProps.downloads_this_year.replace(/,/g, "")))}\n`;
        text += "│\n";
        text += `├ 📜 *Descrição*\n`;
        text += `│  └ ${packageProps.description}\n`;
        text += "│\n";
        text += `├ 🔗 ${packageProps.repository}\n`;
        text += "│\n";
        text += "└──⊣";

        return await msg.reply(text, null, { linkPreview: true });
    }
}
