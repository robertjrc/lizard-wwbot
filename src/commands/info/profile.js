import { Member } from "group-analyzer";

export default {
    name: "perfil",
    category: "informação",
    desc: "",
    async execute(msg, { chat }) {
        const memberInfo = (await Member.getByGroupId(msg.author, chat.id._serialized)).data;

        // if(memberInfo.name !== msg._data.notifyName) await Member.newName(msg._data.notifyName);

        let text = `┌─⊣〔 *${memberInfo.shortName}* 〕Lv. *${memberInfo.level}*\n`;
        text += "│\n";
        text += `├ 💬 *Mensagens*\n│  └ ${(memberInfo.messageCount).toLocaleString()}\n`;
        text += `├ ✨ *XP*\n│  └ *${memberInfo.xp}*/${memberInfo.xpRequired}\n`;
        text += "│\n";
        text += "└─⊣";

        return msg.reply(text);
    }
}
