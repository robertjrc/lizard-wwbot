import { msgResult } from "../../utils/messageResult.js";
import { PopCatService } from "../../services/popCatService.js";
import { MessageMedia } from "../../lib/wwbotjs.js";
import { axdl } from "../../helpers/axdl.js";

export default {
    name: "cor",
    category: "informação",
    wait: true,
    desc: "Retorna informações de uma cor aleatória",
    async execute(msg) {
        const response = await (new PopCatService()).randomColor();

        if (!response.success) {
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        const colorProps = {
            name: response.data.name,
            hex: response.data.hex,
            rgb: response.data.rgb,
            hsl: response.data.hsl,
            brightened: response.data.brightened,
            img_url: response.data.img_url,
        }

        let text = `*${colorProps.name}*\n\n`;
        text += `*HEX:*  ${colorProps.hex}\n`;
        text += `*RBG:*  ${colorProps.rgb}\n`;
        text += `*HSL:*  ${colorProps.hsl}\n`;
        text += `*Iluminada:*  ${colorProps.brightened}`;

        return await msg.reply(
            new MessageMedia("image/jpeg", (await axdl(colorProps.img_url)).toString("base64"), `${Date.now()}.jpeg`),
            null,
            { caption: text }
        );
    }
}
