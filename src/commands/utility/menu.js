import { capitalize } from "../../utils/capitalize.js";
import { getModules } from "../../utils/commandRegistry.js"
import { timeDuration } from "../../helpers/timeDuration.js";
import { importJson } from "../../utils/importJson.js";

export default {
    name: "menu",
    category: "utilidade",
    desc: `
        Exibe o menu interativo com todas as
        categorias e alguns comandos no bot.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg) {
        const { prefix, nickname, owner } = await importJson("src/config/bot.json");
        const { version } = await importJson("package.json");
        const modulesEmoji = await importJson("src/data/modulesEmoji.json");

        const { modules, commandsAmount } = await getModules();

        let text = `┌──⊣〔 *${nickname}* 〕v${version}\n`;
        text += "│\n";
        text += `├ prefixo:  *${prefix}*\n`
        text += `├ categorias:  *${modules.size}*\n`
        text += `├ criado por:  *${owner}*\n`
        text += `├ uptime:  *${timeDuration(global.uptime, "past")}*\n`
        text += "│\n"
        text += `│──⊣〔 *MENU* 〕(${commandsAmount})\n`
        text += "│\n"

        for (let command of modules) {
            text += `├ ${modulesEmoji[command[0]]} ${capitalize(command[0])} (${command[1].length})\n`;
            const subCommand = command[1].slice(0, 3);

            subCommand.forEach((cmd, i) => {
                text += `│ ${(i + 1 === subCommand.length) ? " └" + prefix + cmd.name + "\n" : " ├" + prefix + cmd.name + "\n"}`;
            });
            text += "│\n";
        }
        text += `├${prefix}help\n`;
        text += "│\n";
        text += "└──⊣";

        return await msg.reply(text);
    }
}
