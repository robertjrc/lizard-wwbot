import gTTS from "gtts";
import fs from "node:fs/promises";
import { MessageMedia } from "../../lib/wwbotjs.js";
import { tempFile } from "../../utils/tempFile.js";
import { importJson } from "../../utils/importJson.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "gtts",
    params: ['<pt-br "text">', "<langs>"],
    category: "diversão",
    wait: true,
    desc: `
        Converte texto em áudio usando a
        biblioteca Google Text-to-Speech
        (gTTS), permitindo escolher o idioma
        da fala. 
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { args }) {
        const languages = await importJson("src/data/gttsLanguages.json");

        if (args === "langs") {
            let text = `┌──⊣〔 *Idiomas disponíveis* 〕\n`;
            text += "│\n";

            for (let key in languages) {
                text += `├ *${key}* -> ${languages[key]}\n`;
            }
            text += "│\n";
            text += "└─⊣";

            return await msg.reply(text);
        }

        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça o *nome* ou *URL* da música."
            }));
        }

        const match = args.match(/^([\w-]+)\s+"(.+)"$/);
        const charLimit = 100;

        if (!match) {
            return await msg.reply(msgResult("alert", {
                title: "formato inválido",
                message: 'Por favor, forneça um formato válido (ex: pt-br "text").'
            }));
        }

        if (args.length > charLimit) {
            return msg.reply(msgResult("alert", {
                title: "limite de caracteres",
                message: `Máximo de *${charLimit}* caracteres.`
            }));
        }

        const lang = match[1];
        const text = match[2];

        if (!languages[lang]) {
            return await msg.reply(msgResult("alert", {
                title: "idioma não encontrado",
                message: 'Por favor, forneça um idioma válido.'
            }));
        }

        const tempfile = tempFile("mp3");

        await new Promise(async (resolve, reject) => {
            try {
                const gtts = new gTTS(text, lang);
                gtts.save(`${tempfile}`, (err) => {
                    if (err) return reject();
                    return resolve(true)
                })
            } catch (error) {
                reject();
                return await msg.reply(msgResult("error", {
                    title: "não foi possível",
                    message: "Não foi possível salvar o arquivo."
                }));
            }
        })

        await msg.reply(
            MessageMedia.fromFilePath(tempfile),
            null,
            { sendAudioAsVoice: true }
        );

        return await fs.unlink(tempfile);
    }
}
