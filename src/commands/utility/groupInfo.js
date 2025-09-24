import { Group } from "group-analyzer";
import { numberAbbreviation } from "../../helpers/numberAbbreviation.js";
import { importJson } from "../../utils/importJson.js";
import { relativeTime } from "../../helpers/relativeTime.js";

export default {
    name: "grupoinfo",
    category: "utilidade",
    desc: `
        Retorna informações do grupo,
        incluindo quantidade de administradores,
        membros totais, membros ativos e outros
        dados relevantes.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { chat }) {
        const groupId = chat.id._serialized;
        const { nickname } = await importJson("src/config/bot.json");
        const { version } = await importJson("package.json");
        const admins = chat.participants.filter(x => x.isAdmin);

        const group = (await Group.getById(groupId)).data;
        const members = (await Group.getMembers(groupId)).data;
        let activites = 0;

        function isToday(timestamps) {
            const date = new Date(timestamps);
            const today = new Date();

            return (
                date.getUTCFullYear() === today.getUTCFullYear() &&
                date.getUTCMonth() === today.getUTCMonth() &&
                date.getUTCDate() === today.getUTCDate()
            );
        }

        function nameLimit(name) {
            const charLimit = 20;

            return (name.length > charLimit) ? `${name.substring(0, charLimit)}...` : name;
        }

        for (let member of members) { if (isToday(member.lastMessageAt)) activites += 1; }

        let text = `┏━━【 *${nickname}* 】v${version}\n`;
        text += "┃\n"
        text += `┣ 🏠 *${nameLimit(group.name)}*\n`
        text += `┃  ├ Admins: *${admins.length}*\n`;
        text += `┃  ├ Membros: *${group.memberCount}*\n`;
        text += `┃  ├ Ativos: *${activites}* (${(activites / group.memberCount).toFixed(1)}%)\n`;
        text += `┃  ├ Mensagens: *${numberAbbreviation(group.messageCount)}*\n`;
        text += `┃  ├ Atividade: *${relativeTime(group.registeredAt, "past")}*\n`;
        text += `┃  └ Criado em: *${new Date(group.createdAt).toLocaleString("pt-BR", { dateStyle: "short" })}*\n`;
        text += "┃\n";
        text += "┗━━";

        return await msg.reply(text);
    }
}
