import { DeezerService } from "../../services/deezerService.js";
import { msgResult } from "../../utils/messageResult.js";
import { axdl } from "../../helpers/axdl.js"
import { MessageMedia } from "../../lib/wwbotjs.js";

export default {
    name: "deezer",
    params: ["<song>"],
    category: "pesquisa",
    wait: true,
    desc: `
        O comando deezer realiza
        buscas por faixas musicais
        (tracks) no catálogo do Deezer,
        retornando resultados com
        informações como título, artista,
        e link para a música.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { args }) {
        const charLimit = 255;

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça o *nome* da música."
            }));
        }

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        const deezer = (await new DeezerService().search(args));

        if (!deezer.success) {
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: deezer.message
            }));
        }

        if(!deezer.data) {
            return await msg.reply(msgResult("alert", {
                title: "não foi possível",
                message: "conteudo não encontrado."
            }));
        }

        const searchProps = {
            url: deezer.data.data[0].link,
            preview_url: deezer.data.data[0].preview,
        };

        await msg.reply(searchProps.url, null, { linkPreview: true });

        if (searchProps.preview_url === null) return;

        const audioData = await axdl(searchProps.preview_url);
        const audioMedia = new MessageMedia('audio/mp3', audioData.toString('base64'), `${Date.now()}.mp3`);

        return await msg.reply(audioMedia);
    }
}
