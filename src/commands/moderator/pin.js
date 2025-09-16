import { relativeTime } from "../../helpers/relativeTime.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "fixar",
    params: ["<24h>"],
    aliases: ["pin"],
    category: "moderação",
    desc: `
        Fixa a mensagem marcada no
        grupo pelo tempo especificado
        (exemplo: 24h, 7d, 30d).
    `.replace(/\s+/g, ' ').trim(),
    admin: true,
    async execute(msg, { chat, args }) {
        if (!(chat.participants.find(x => x.id._serialized === msg.to)).isAdmin) {
            return msg.reply(msgResult("alert", {
                title: "sem permissão",
                message: "Por favor, forneça acesso *admin* para o bot."
            }));
        }

        if (!msg.hasQuotedMsg) {
            return msg.reply(msgResult("alert", {
                title: "sem conteúdo",
                message: "Por favor, marque a mensagem que você deseja fixar."
            }));
        }

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça a duração (ex 24h, 7d, 30d)."
            }));
        }

        const timeRef = args;

        let time = parseInt(timeRef, 10);
        let type = timeRef.replace(/[0-9]/g, "");

        const types = {
            24: "h",
            7: "d",
            30: "d"
        }

        if (!types[time]) {
            return msg.reply(msgResult("alert", {
                title: "valor inválido",
                message: `Por favor, forneça um valor válido (ex: 24h, 7d, 30d).`
            }));
        }

        if (type !== types[time]) {
            return msg.reply(msgResult("alert", {
                title: "tipo inválido",
                message: "Por favor, forneça um tipo de duração válido (ex: h, d)."
            }));
        }

        const quotedMsg = await msg.getQuotedMessage();
        let duration = 0;

        switch (type) {
            case "h": duration = time * 60 * 60; break;
            case "d": duration = time * 24 * 60 * 60; break;
            default: duration = time * 60 * 60; break;
        }

        await quotedMsg.pin(duration);

        return await chat.sendMessage(msgResult("success", {
            title: "contéudo fixado",
            message: `Mensagem fixada por *${relativeTime(Date.now() + (duration * 1000), "future")}*.`
        }));
    }
}
