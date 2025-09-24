import { MessageMedia } from "../../lib/wwbotjs.js";
import { msgResult } from "../../utils/messageResult.js";
import { AudioEffectService } from "../../services/audioEffectService.js";

export default {
    name: "audio",
    params: ["<grave>", "<effects>"],
    category: "mídia",
    desc: `
        Aplica efeitos ao áudio
        marcado, como grave,
        estourado, reverso, acelerar,
        entre outros disponíveis.
    `.replace(/\s+/g, ' ').trim(),
    wait: true,
    async execute(msg, { args }) {
        const charLimit = 10;
        const audioEffect = new AudioEffectService();

        if (args === "effects") {
            let text = `┏━━【 *Efeitos disponíveis* 】\n`;
            text += "┃\n";

            for (let effect in audioEffect.getEffects()) {
                text += `┣ ${effect}\n`;
            }

            text += "┃\n";
            text += "┗━━";

            return await msg.reply(text);
        }

        if (!msg.hasQuotedMsg) {
            return await msg.reply(msgResult("alert", {
                title: "sem conteúdo",
                message: "Por favor, marque o áudio que você deseja adcionar o efeito."
            }));
        }

        const quotedMsg = await msg.getQuotedMessage();

        if (!quotedMsg.hasMedia || quotedMsg.type !== "audio") {
            return await msg.reply(msgResult("error", {
                title: "não possível",
                message: "O conteúdo marcado não é válido."
            }));
        }

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça o *efeito* (ex: grave)."
            }));
        }

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        if (!audioEffect.getEffect(args)) {
            return msg.reply(msgResult("alert", {
                title: "efeito não encontrado",
                message: "Por favor, forneça um *efeito* válido."
            }));
        }

        const { duration } = quotedMsg._data;

        const nextEffect = audioEffect.nextEffect(msg.author, Number(duration));
        if (!nextEffect.success) {
            return msg.reply(msgResult("alert", {
                title: "tempo de espera",
                message: nextEffect.message
            }));
        }

        const media = await quotedMsg.downloadMedia();

        const response = await audioEffect.setEffect(media, args);

        if (!response.success) {
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        return await msg.reply(new MessageMedia("audio/mp3", response.data, `${Date.now()}.mp3`));
    }
}
