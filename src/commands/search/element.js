import { PopCatService } from "../../services/popCatService.js"
import { msgResult } from "../../utils/messageResult.js";
import { MessageMedia } from "../../lib/wwbotjs.js";

export default {
    name: "elemento",
    category: "informação",
    wait: true,
    desc: `
        Retorna informações sobre um elemento
        químico aleatório da Tabela Periódica,
        incluindo símbolo, número atômico e
        principais propriedades.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg) {
        const response = await (new PopCatService().periodicTable());

        if (!response.success) {
            return await msg.reply(msgResult("error", {
                title: "não foi possível",
                message: response.message
            }));
        }

        const elementProps = {
            name: response.data.name,
            symbol: response.data.symbol,
            atomic_number: response.data.atomic_number,
            atomic_mass: response.data.atomic_mass,
            period: response.data.period,
            phase: response.data.phase,
            discovered_by: response.data.discovered_by,
            img_url: response.data.img_url,
            summary: response.data.summary
        }

        let text = `┌──⊣〔 *${elementProps.name}* 〕\n`;
        text += "│\n";
        text += `├ ⚛️ *Símbolo*\n`;
        text += `│  └ ${elementProps.symbol}\n`;
        text += `├ 🔢 *Número atômico*\n`;
        text += `│  └ ${elementProps.atomic_number}\n`;
        text += `├ 🔢 *Massa atômica*\n`;
        text += `│  └ ${elementProps.atomic_mass}\n`;
        text += `├ 🗓️ *Perído*\n`;
        text += `│  └ ${elementProps.period}\n`;
        text += `├ 🔥 *Fase*\n`;
        text += `│  └ ${elementProps.phase}\n`;
        text += `├ 🔎 *Descoberto por*\n`;
        text += `│  └ ${elementProps.discovered_by}\n`;
        text += "│\n";
        text += `├ 📜 *Sumário*\n`;
        text += `│  └ ${elementProps.summary}\n`;
        text += "│\n";
        text += "└──⊣";

        return await msg.reply(
            await MessageMedia.fromUrl(elementProps.img_url, { unsafeMime: true }),
            null,
            { caption: text });
    }
}
