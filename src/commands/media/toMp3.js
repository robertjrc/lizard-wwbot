import { bytesToMB } from "../../helpers/bytesToMB.js";
import { videoToMp3 } from "../../helpers/videoToMp3.js";
import { msgResult } from "../../utils/messageResult.js"
import { MessageMedia } from "../../lib/wwbotjs.js";

export default {
    name: "tomp3",
    category: "mídia",
    desc: `
        Extrai o áudio do vídeo
        marcado e retorna o
        arquivo em formato .mp3. 
    `.replace(/\s+/g, ' ').trim(),
    wait: true,
    async execute(msg) {
        if (!msg.hasQuotedMsg) {
            return await msg.reply(msgResult("alert", {
                title: "sem conteúdo",
                message: "Por favor, marque o vídeo que você deseja extrair o áudio."
            }));
        }

        const quotedMsg = await msg.getQuotedMessage();

        if (!quotedMsg.hasMedia || quotedMsg.type !== "video") {
            return await msg.reply(msgResult("error", {
                title: "não possível",
                message: "O conteúdo marcado não é válido."
            }));
        }

        const { size } = quotedMsg._data;
        const MBLimit = 30;

        if (bytesToMB(size) > MBLimit) {
            return await msg.reply(msgResult("alert", {
                title: "limite máximo",
                message: `O vídeo excedeu o limite máximo de *${MBLimit}MB*.`
            }));
        }

        try {
            const media = await quotedMsg.downloadMedia();
            const data = await videoToMp3(media);

            return await msg.reply(new MessageMedia("audio/mp3", data.toString("base64"), `${Date.now()}.mp3`));
        } catch (error) {
            console.error(error);
            return await msg.reply(msgResult("error", {
                title: "não possível",
                message: "Não foi possível converter."
            }));
        }
    }
}
