import { Member } from "group-analyzer";

export default {
    name: "topmembros",
    admin: true,
    category: "utilidade",
    desc: `
        Lista os 10 membros mais
        ativos do grupo, com base
        no sistema de XP, exibindo
        o ranking atualizado.
    `.replace(/\s+/g, ' ').trim(),
    async execute(_, { chat }) {
        const groupId = chat.id._serialized;

        const members = (await Member.getAllByGroupId(groupId)).data;

        let text = "";

        function nameLimit(name) {
            const charLimit = 10;

            return (name.length > charLimit) ? `${name.substring(0, charLimit)}...` : name;
        }

        text += "Principais *Membros*\n\n";

        if (members.length === 0) return await chat.sendMessage("seja o primeiro no ranque.\n");

        members.sort((x, y) => {
            return x.xpRequired - y.xpRequired;
        }).reverse();

        let index = 0;

        const nMembers = members.length;
        const topThreeMembers = members.slice(0, 3);
        const othersMembers = members.slice(3, 10);
        const medals = ["🥇", "🥈", "🥉"];

        for (let i = 0; i < topThreeMembers.length; i++) {
            index += 1;
            text += `${index}° *@${nameLimit(topThreeMembers[i].name)}* ┃ ${topThreeMembers[i].xpRequired} XP`;
            text += `${medals[i]}\n`;
        }

        for (let i = 0; i < othersMembers.length; i++) {
            index += 1;
            text += `${index}° *@${nameLimit(othersMembers[i].name)}* ┃ ${othersMembers[i].xpRequired} XP\n`;
        }

        if (nMembers > 10) {
            const rest = nMembers - 10;

            text += `\n*+${rest}...*`;
        }

        return await chat.sendMessage(text);
    }
}
