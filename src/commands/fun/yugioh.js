import { MessageMedia } from "../../lib/wwbotjs.js";
import { msgResult } from "../../utils/messageResult.js";
import { YugiohService } from "../../services/yugiohService.js";

export default {
    name: "yugioh",
    category: "diversão",
    wait: true,
    desc: `
          Retorna informações detalhadas sobre uma carta do Yu-Gi-Oh!,
          incluindo atributos, tipo,
          efeito e imagem ilustrativa (quando disponível).
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg) {
        const yugioh = new YugiohService();
        const response = await yugioh.getInfo();

        if (!response.success) {
            return msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        const cardProps = {
            name: response.data.name,
            type: response.data.type,
            atk: response.data.atk,
            def: response.data.def,
            level: response.data.level,
            desc: response.data.desc,
            img_url: response.data.img_url,
        }

        const cardPowers = new Array();

        if (cardProps.atk) cardPowers.push(["ATK", cardProps.atk]);
        if (cardProps.def) cardPowers.push(["DEF", cardProps.def]);

        const powersFormat = (card, i) => {
            return (i + 1 === cardPowers.length)
                ? `└ ${card[0]}: *${card[1]}*\n`
                : `├ ${card[0]}: *${card[1]}*\n`
        }

        function shortName(name) {
            const charLimit = 20;

            return (name.length > charLimit) ? `${name.substring(0, charLimit)}...` : name;
        }

        let text = `┌──⊣〔 *${shortName(cardProps.name)}* 〕 ${(cardProps.level) ? "Lv." + cardProps.level : ""}\n`;
        text += "│\n";
        text += `├ 🔥 *${cardProps.type}*\n`;
        cardPowers.forEach((card, i) => {
            text += ("│  " + powersFormat(card, i));
        });
        text += "│\n";
        text += `├ ${cardProps.desc}\n`;
        text += "│\n";
        text += "└──⊣";

        return await msg.reply(
            await MessageMedia.fromUrl(cardProps.img_url),
            null,
            { caption: text }
        );
    }
}
