import { analyze } from "group-analyzer";
import { getCommand } from "../utils/commandRegistry.js";
import { AntiSpamService } from "../services/antiSpamService.js";
import { msgResult } from "../utils/messageResult.js";
import { TimeoutVerifyService } from "../services/timeoutVerifyService.js";

const { prefix } = await (await import("../utils/importJson.js")).importJson("src/config/bot.json");

export default async (client, msg) => {
    const chat = await msg.getChat();

    if (!chat.isGroup) return;
    await analyze.on(chat);
    if (!msg.body.startsWith(prefix)) return;

    const commandName = msg.body.split(prefix)[1].split(" ")[0].toLowerCase();
    const args = msg.body.substring(commandName.length + 2) || null;

    const command = await getCommand(commandName);
    if (!command) return;

    if((await TimeoutVerifyService.on(chat.id._serialized, msg.author)).success) return;

    if (command.wait) msg.react("⏳");

    (await AntiSpamService.check(chat.id._serialized, msg.author).then(res => {
        if (!res.message) return;
        msg.reply(msgResult("alert", {
            title: "você recebeu um timeout",
            message: res.message 
        }));
    }));

    try {
        return await command.execute(msg, { client, chat, args });
    } catch (error) {
        console.error(error);
        return await msg.reply("Erro ao executar o comando.");
    }
}
