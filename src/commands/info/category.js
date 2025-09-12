import { capitalize } from "../../utils/capitalize.js";
import { getModule, getModules } from "../../utils/commandRegistry.js"
import { msgResult } from "../../utils/messageResult.js";
const {
    prefix,
    nickname,
} = await (await import("../../utils/importJson.js")).importJson("src/config/bot.json");
const { version } = await (await import("../../utils/importJson.js")).importJson("package.json");
const modulesEmoji = await (await import("../../utils/importJson.js")).importJson("src/data/modulesEmoji.json");

export default {
    name: "categoria",
    params: ["<category>"],
    category: "informação",
    desc: "Lista todas as categorias disponíveis. Se for especificado um nome, exibe os comandos pertencentes apenas àquela categoria.",
    async execute(msg, { args }) {
        let text = `┌──⊣〔 *${nickname}* 〕v${version}\n`;
        text += "│\n";

        if (!args) {
            const { modules } = await getModules();

            for (let module of modules) {
                text += `├ *${capitalize(module[0])}* (${module[1].length})\n`;
            }

            text += "│\n";
            text += `├${prefix}categoria ${"```<category>```"}\n`;
            text += "│\n";
            text += "└──⊣";

            return await msg.reply(text);
        }

        const module = await getModule(args.toLowerCase());
        if (!module) {
            return msg.reply(msgResult("alert", {
                title: "conteúdo não encontrado",
                message: `A categoria "${args}" não foi encontrada, ou não é uma categoria.`
            }));
        }

        text += `├ ${modulesEmoji[module[0].category]} *${capitalize(module[0].category)}* (${module.length})\n`;

        const cmdFormat = (cmd, i) => {
            return (i + 1 === module.length)
                ? ` └${prefix}${cmd.name} ${((cmd.params) ? "```" + cmd.params[0] + "```" : "")} \n`
                : ` ├${prefix}${cmd.name} ${((cmd.params) ? "```" + cmd.params[0] + "```" : "")} \n`
        }

        module.forEach((cmd, i) => {
            text += ("│ " + cmdFormat(cmd, i));
        });

        text += "│\n";
        text += (`├${prefix}help ` + "```<command>```\n");
        text += "│\n";
        text += "└──⊣";

        return await msg.reply(text);
    }
}
