import { MessageMedia } from "../../lib/wwbotjs.js";
import { axdl } from "../../helpers/axdl.js";
import { SpofityService } from "../../services/spotifyService.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "spotify",
    params: ["<name>"],
    category: "pesquisa",
    desc: `
        Retorna informações do
        spotify sobre a música
        pesquisada.
    `.replace(/\s+/g, ' ').trim(),
    wait: true,
    async execute(msg, { args }) {
        const charLimit = 50;
        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça o *nome* ou *URL* da música."
            }));
        }

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        const spotify = new SpofityService();
        const data = await spotify.getTrack(args);

        const searchProps = {
            url: data.external_urls.spotify,
            preview_url: data.preview_url,
        };

        await msg.reply(searchProps.url, null, { linkPreview: true });

        if (searchProps.preview_url === null) return;

        const audioData = await axdl(searchProps.preview_url);
        const audioMedia = new MessageMedia('audio/mp3', audioData.toString('base64'), `${Date.now()}.mp3`);

        return await msg.reply(audioMedia);
    }
}

