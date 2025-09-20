import { RNG } from "../../utils/RNG.js";
import { importJson } from "../../utils/importJson.js";

export default {
    name: "casal",
    category: "diversão",
    desc: `
        Seleciona aleatoriamente
        dois membros do grupo e
        os forma como um “casal”.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { chat }) {
        const coupleMessages = await importJson("src/data/coupleMessages.json");

        const n = chat.participants.length;
        const member01 = chat.participants[RNG(n, 0)].id._serialized;
        const member02 = chat.participants[RNG(n, 0)].id._serialized;

        const message = coupleMessages[RNG(coupleMessages.length, 0)];

        message.message = message.message.replace("@Person1", `*@${member01.split("@")[0]}*`);
        message.message = message.message.replace("@Person2", `*@${member02.split("@")[0]}*`);

        const sent = await msg.reply(`🔄 Formando casal...`);

        await new Promise(resolve => setTimeout(resolve, 2000));

        let text = `*${message.title}*\n\n`;
        text += `${message.message}`;

        await sent.edit(text, { mentions: [member01, member02] });
    }
}
