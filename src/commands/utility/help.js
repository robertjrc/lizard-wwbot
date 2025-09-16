import { capitalize } from "../../utils/capitalize.js";
import { getCommand } from "../../utils/commandRegistry.js"
import { msgResult } from "../../utils/messageResult.js";
import { importJson } from "../../utils/importJson.js";

export default {
    name: "help",
    params: ["<command>"],
    category: "utilidade",
    desc: `
        Exibe informações sobre categorias 
        de comandos e suas funcionalidades.
        Se for especificado um comando,
        mostra detalhes sobre seu uso.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { args }) {
        const { prefix, nickname } = await importJson("src/config/bot.json");
        const { version } = await importJson("package.json");
        let text;

        if (!args) {
            text = `┌──⊣〔 *${nickname}* 〕v${version}\n`;
            text += "│\n"
            text += "├ *Lista as categorias*\n"
            text += `│ └${prefix}categoria\n`
            text += "│\n"
            text += "├ *Obtém a categoria*\n"
            text += `│ └${prefix}categoria *<category>*\n`
            text += "│\n"
            text += "├ *Obtém o comando*\n"
            text += `│ └${prefix}help *<command>*\n`;
            text += "│\n"
            text += "└──⊣";

            return await msg.reply(text);
        }
        const command = await getCommand(args.toLowerCase());
        if (!command) {
            return msg.reply(msgResult("alert", {
                title: "conteúdo não encontrado",
                message: `O comando "${args}" não foi encontrado, ou não é um comando.`
            }));
        }

        const paramFormat = (param, i) => {
            return (i + 1 === command.params.length)
                ? `└${prefix}${command.name} ${"*" + param + "*"} \n`
                : `├${prefix}${command.name} ${"*" + param + "*"} \n`
        }

        text = `┌──⊣〔 *${capitalize(command.name)}* 〕\n`;
        text += "│\n";
        text += `├ 📁 *Categoria*\n│  └ ${capitalize(command.category)}\n`;
        text += "│\n";
        if (command.params) {
            text += `├ ℹ️ *Parâmetro's*\n`;
            command.params.forEach((param, i) => {
                text += ("│  " + paramFormat(param, i));
            });
            text += "│\n";
        }
        if (command.aliases) {
            text += `├ 🔗 Referência's\n`;
            command.aliases.forEach((alias, i) => {
                text += `│ ${(i + 1 == command.aliases.length) ? " └" + prefix + alias + "\n" : " ├" + prefix + alias + "\n"}`;
            });
            text += "│\n";
        }
        text += `├ 📜 *Descrição*\n│  └ ${command.desc}\n`;
        text += "│\n";
        text += "└──⊣";

        return await msg.reply(text);
    }
}
