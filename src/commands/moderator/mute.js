import { msgResult } from "../../utils/messageResult.js";
import { relativeTime } from "../../helpers/relativeTime.js";

export default {
    name: "mute",
    params: ["<30m>"],
    category: "moderação",
    desc: `
        Desativa o chat do grupo
        por um tempo definido 
        (exemplo: 30m, 2h).
    `.replace(/\s+/g, ' ').trim(),
    admin: true,
    async execute(msg, { chat, args }) {
        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça a duração (ex 30m)."
            }));
        }

        const timeRef = args;

        let time = parseInt(timeRef, 10);
        let type = timeRef.replace(/[0-9]/g, "");
        let duration = 0;

        const types = {
            "s": { limit: 60, longType: "SEGUNDOS" },
            "m": { limit: 60, longType: "MINUTOS" },
            "h": { limit: 24, longType: "HORAS" }
        }

        if (!types[type]) {
            return msg.reply(msgResult("alert", {
                title: "tipo inválido",
                message: "Por favor, forneça um tipo de duração válido (ex: m, h)."
            }));
        }

        if (time > types[type].limit || time <= 0) {
            return msg.reply(msgResult("alert", {
                title: "valor inválido",
                message: `Forneça um valor entre *1* e *${types[type].limit}* para *${types[type].longType}*.`
            }));
        }

        switch (type) {
            case "s": duration = time * 1000; break;
            case "m": duration = time * 60 * 1000; break;
            case "h": duration = time * 60 * 60 * 1000; break;
            default: duration = 30 * 60 * 1000; break;
        }

        await chat.setMessagesAdminsOnly(true);
        await chat.sendMessage(`🔒 chat desativado por *${relativeTime(Date.now() + duration, "future")}*.\n`);

        setTimeout(async () => {
            await chat.setMessagesAdminsOnly(false);
            await chat.sendMessage("✅ chat ativo.");
        }, duration);

        return;
    }
}
