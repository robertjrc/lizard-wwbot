import { Member } from "group-analyzer";
import { getContactLid } from "../../utils/getContactLid.js";

export default {
    name: "perfil",
    category: "utilidade",
    desc: `
        Exibe a latência atual do bot em milissegundos,
        útil para verificar a responsividade da conexão.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { client, chat }) {
        const memberInfo = (await Member.getByGroupId(await getContactLid(client, msg.author), chat.id._serialized)).data;

        if (memberInfo.name !== msg._data.notifyName) await Member.newName(msg._data.notifyName);

        let text = `Perfil de *${memberInfo.shortName}* 👤\n`;
        text += "\n"
        text += `*Nível:* ${memberInfo.level} 🌟\n`;
        text += `*Mensagens:* ${(memberInfo.messageCount).toLocaleString()} 💬\n`;
        text += `*XP:* *${memberInfo.xp}*/${memberInfo.xpRequired} `;
        text += `(${((memberInfo.xp / memberInfo.xpRequired) * 100).toFixed(0)}%) 📈\n`;

        return msg.reply(text);
    }
}
