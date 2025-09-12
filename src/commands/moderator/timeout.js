import { Group, Member } from "group-analyzer";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "timeout",
    params: ["<@user 1h reason>"],
    category: "moderação",
    admin: true,
    desc: "Impede o usuário de executar comandos temporariamente. É possível definir a duração e opcionalmente um motivo para o bloqueio.",
    async execute(msg, { chat, args }) {
        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça os argumentos corretos (ex: @member 1h reason)."
            }));
        }

        const info = args.trim().split(/\s+/) || [];

        if (!info[0]) {
            return msg.reply(msgResult("alert", {
                title: "membro inválido",
                message: "Por favor, mencione um membro válido."
            }));
        }

        if (!info[1]) {
            return msg.reply(msgResult("alert", {
                title: "duração inválida",
                message: "Por favor, forneça uma duração válida (ex: 1h, 30m)."
            }));
        }

        const groupId = chat.id._serialized;
        const memberId = info[0].split("@")[1] + "@c.us";
        const timeRef = info[1];
        const reason = info.slice(2).join(" ") || "Nenhum motivo fornecido.";

        let time = parseInt(timeRef, 10);
        let type = timeRef.replace(/[0-9]/g, "");

        const types = {
            "s": { limit: 60, longType: "SEGUNDOS" },
            "m": { limit: 60, longType: "MINUTOS" },
            "h": { limit: 24, longType: "HORAS" },
            "d": { limit: 7, longType: "DIAS" }
        }

        if (!types[type]) {
            return msg.reply(msgResult("alert", {
                title: "tipo inválido",
                message: "Por favor, forneça um tipo de duração válida (ex: m, h)."
            }));
        }

        if (time > types[type].limit || time <= 0) {
            return msg.reply(msgResult("alert", {
                title: "valor inválido",
                message: `Forneça um valor entre *1* e *${types[type].limit}* para *${types[type].longType}*.`
            }));
        }

        if (!chat.participants.some(member => member.id._serialized === memberId)) {
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: "Membro não encontrado."
            }));
        }

        const memberResponse = await Member.getByAssociation(memberId, groupId);
        if (!memberResponse.success) {
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: "O membro fornecido não é ativo."
            }));
        }

        const timeoutResponse = (await Group.timeoutVerify(chat.id._serialized, memberId)).data;
        if (timeoutResponse) {
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: "O membro já está em um timeout."
            }));
        }

        await Group.setTimeout(groupId, memberId, { timeRef, reason });

        let text = `Membro: *@${memberId.split("@")[0]}*\n`
        text += `Duração: *${timeRef}*\n`
        text += `Motivo: *${reason}*\n\n`
        text += `Durante esse período, *@${memberId.split("@")[0]}* não poderá usar os comandos do bot.`

        let result = msgResult("success", {
            title: "timeout aplicado",
            message: text
        });

        return await msg.reply(result, null, { mentions: [memberId] });
    }
}
