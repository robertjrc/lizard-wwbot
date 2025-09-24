import { Member } from "group-analyzer";
import { importJson } from "../../utils/importJson.js";

export default {
    name: "perfil",
    category: "utilidade",
    desc: `
        Exibe a latência atual do bot em milissegundos,
        útil para verificar a responsividade da conexão.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { chat }) {
        const { nickname } = await importJson("src/config/bot.json");
        const { version } = await importJson("package.json");
        const memberInfo = (await Member.getByGroupId(msg.author, chat.id._serialized)).data;

        if (memberInfo.name !== msg._data.notifyName) await Member.newName(msg._data.notifyName);

        let text = `┏━━【 *${nickname}* 】v${version}\n`;
        text += "┃\n"
        text += `┣ 👤 *${memberInfo.name}*\n`
        text += `┃  ├ Nível: *${memberInfo.level}*\n`;
        text += `┃  ├ Mensagens: *${(memberInfo.messageCount).toLocaleString()}*\n`;
        text += `┃  └ XP: *${memberInfo.xp}*/${memberInfo.xpRequired}\n`;
        text += "┃\n";
        text += "┗━━";

        return msg.reply(text);
    }
}
