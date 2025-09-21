import { msgResult } from "../../utils/messageResult.js";
import { axdl } from "../../helpers/axdl.js";
import { PopCatService } from "../../services/popCatService.js";
import { MessageMedia } from "../../lib/wwbotjs.js";

export default {
    name: "carro",
    category: "informação",
    wait: true,
    desc: "Retorna uma imagem de um carro aleatório.",
    async execute(msg) {
        const response = await (new PopCatService()).randomCar();

        if (!response.success) {
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        const carProps = {
            title: response.data.title,
            img_url: response.data.img_url,
        }

        return await msg.reply(
            new MessageMedia("image/jpeg", (await axdl(carProps.img_url)).toString("base64"), `${Date.now()}.jpeg`),
            null,
            { caption: `*${carProps.title}*` }
        );
    }
}
